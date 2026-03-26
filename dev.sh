#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Levanta el entorno de desarrollo local en Linux (WSL2 o VPS)
#
# Este script NO instala Docker, Bun ni Node.js.
# Esos componentes son prerequisitos del sistema.
#
# Uso:
#   ./dev.sh          → levanta todo (DB + build MC image + API + frontend)
#   ./dev.sh db       → solo PostgreSQL
#   ./dev.sh api      → solo la API (asume DB ya corre)
#   ./dev.sh panel    → solo el frontend (asume API ya corre)
#   ./dev.sh mc-build → solo rebuild de la imagen Minecraft
#   ./dev.sh reset-db → reinicia PostgreSQL dev (borra volumen)
#   ./dev.sh stop     → detiene todo
#   ./dev.sh check    → valida prerequisitos del sistema
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
CYAN="\033[1;36m"
NC="\033[0m"

log()  { echo -e "${GREEN}[dev]${NC} $*"; }
warn() { echo -e "${YELLOW}[dev]${NC} $*"; }
err()  { echo -e "${RED}[dev]${NC} $*" >&2; }
info() { echo -e "${CYAN}[dev]${NC} $*"; }

# ── Verificar requisitos del sistema ──────────────────────────────────────────

NODE_MIN_MAJOR=24
COMPOSE_CMD=()

check_linux_runtime() {
  if [[ "$(uname -s)" != "Linux" ]]; then
    err "Este script está pensado para Linux (WSL2 o VPS)."
    err "Ejecuta ./dev.sh desde una shell Linux."
    exit 1
  fi

  if grep -qi microsoft /proc/version 2>/dev/null; then
    log "Sistema detectado: Linux sobre WSL"
  else
    log "Sistema detectado: Linux"
  fi
}

resolve_compose_cmd() {
  if try_resolve_compose_cmd; then
    return
  fi
  err "No se encontró Docker Compose."
  err "Instala Docker Compose v2 (docker compose) o docker-compose."
  exit 1
}

try_resolve_compose_cmd() {
  if docker compose version &>/dev/null; then
    COMPOSE_CMD=("docker" "compose")
    return 0
  fi
  if command -v docker-compose &>/dev/null; then
    COMPOSE_CMD=("docker-compose")
    return 0
  fi
  return 1
}

compose() {
  "${COMPOSE_CMD[@]}" "$@"
}

check_docker() {
  if ! command -v docker &>/dev/null; then
    err "Docker no está instalado. Instálalo primero:"
    err "  https://docs.docker.com/engine/install/ubuntu/"
    exit 1
  fi
  if ! docker info &>/dev/null 2>&1; then
    err "Docker no está corriendo. Inicialo con:"
    err "  sudo systemctl start docker"
    err "  o abre Docker Desktop"
    exit 1
  fi
  resolve_compose_cmd
  log "Docker listo: $(docker --version)"
}

check_bun() {
  if ! command -v bun &>/dev/null; then
    err "Bun no está instalado. Instálalo y vuelve a ejecutar."
    err "  https://bun.sh/docs/installation"
    exit 1
  fi
  log "Bun listo: $(bun --version)"
}

check_node_npm() {
  if ! command -v node &>/dev/null; then
    err "Node.js no está instalado. Requerido: v${NODE_MIN_MAJOR}+."
    exit 1
  fi
  if ! command -v npm &>/dev/null; then
    err "npm no está disponible. Instala Node.js completo (incluye npm)."
    exit 1
  fi

  local node_major
  node_major="$(node --version | sed 's/^v//' | cut -d. -f1)"
  if ! [[ "$node_major" =~ ^[0-9]+$ ]]; then
    err "No se pudo interpretar la versión de Node.js: $(node --version)"
    exit 1
  fi
  if (( node_major < NODE_MIN_MAJOR )); then
    err "Node.js $(node --version) detectado, se requiere v${NODE_MIN_MAJOR}+."
    exit 1
  fi

  log "Node.js listo: $(node --version)"
  log "npm listo: $(npm --version)"
}

apply_db_env_defaults() {
  export POSTGRES_DB="${POSTGRES_DB:-mcpanel}"
  export POSTGRES_USER="${POSTGRES_USER:-mcadmin}"
  export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-devpassword}"
  export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}}"
}

load_env_dev_optional() {
  if [ -f "$ROOT_DIR/.env.dev" ]; then
    set -a
    source "$ROOT_DIR/.env.dev"
    set +a
  fi
  apply_db_env_defaults
}

check_db_env_consistency() {
  local expected_prefix="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/"
  if [[ "${DATABASE_URL}" != ${expected_prefix}${POSTGRES_DB}* ]]; then
    warn "DATABASE_URL no coincide con POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB/POSTGRES_PORT."
    warn "En dev, mantén credenciales alineadas para evitar errores de autenticación."
  fi
}

check_system_prereqs() {
  log "Verificando dependencias del sistema..."
  check_linux_runtime
  check_docker
  check_bun
  check_node_npm
  load_env_dev_optional
  check_db_env_consistency
  log "Todas las dependencias del sistema listas"
}

# ── Funciones ────────────────────────────────────────────────────────────────

start_db() {
  load_env_dev_optional
  check_docker
  log "Levantando PostgreSQL..."
  compose -f docker-compose.dev.yml up -d

  log "Esperando a que PostgreSQL esté listo..."
  local attempts=0
  until compose -f docker-compose.dev.yml exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" &>/dev/null; do
    sleep 1
    ((attempts++))
    if (( attempts > 30 )); then
      err "PostgreSQL no respondió tras 30 segundos"
      exit 1
    fi
  done
  verify_postgres_credentials
  log "PostgreSQL listo en localhost:${POSTGRES_PORT}"
}

build_mc_image() {
  check_docker
  log "Construyendo imagen Docker de Minecraft..."
  docker build \
    --build-arg MC_VERSION=1.21 \
    -t mc-server:latest \
    ./docker/minecraft/
  log "Imagen mc-server:latest construida"
}

install_and_migrate_api() {
  log "Instalando dependencias del backend..."
  cd "$ROOT_DIR/mc-api"
  bun install

  log "Ejecutando migraciones..."
  load_env_dev
  bun src/infrastructure/persistence/migrate.ts
  cd "$ROOT_DIR"
}

start_api() {
  cd "$ROOT_DIR/mc-api"

  # Instalar deps si no existen
  if [ ! -d "node_modules" ]; then
    log "node_modules no encontrado, instalando..."
    bun install
  fi

  load_env_dev

  log "Iniciando mc-api en http://localhost:3001"
  bun --watch src/index.ts
}

install_panel() {
  log "Instalando dependencias del frontend..."
  cd "$ROOT_DIR/mc-panel"
  npm install
  cd "$ROOT_DIR"
}

start_panel() {
  cd "$ROOT_DIR/mc-panel"

  # Instalar deps si no existen
  if [ ! -d "node_modules" ]; then
    log "node_modules no encontrado, instalando..."
    npm install
  fi

  # Exportar variables del frontend
  export NEXT_PUBLIC_API_URL=http://localhost:3001
  export NEXT_PUBLIC_WS_URL=http://localhost:3001

  log "Iniciando mc-panel en http://localhost:3000"
  npm run dev
}

stop_all() {
  log "Deteniendo servicios..."

  if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    if try_resolve_compose_cmd && compose -f docker-compose.dev.yml ps --status running 2>/dev/null | grep -q postgres; then
      compose -f docker-compose.dev.yml down
      log "PostgreSQL detenido"
    fi

    # Contenedores Minecraft
    local mc_containers
    mc_containers=$(docker ps --filter "label=mc-panel.managed=true" -q 2>/dev/null || true)
    if [ -n "$mc_containers" ]; then
      echo "$mc_containers" | xargs docker stop 2>/dev/null || true
      log "Contenedores Minecraft detenidos"
    fi
  else
    warn "Docker no disponible; se omite parada de contenedores."
  fi

  # Matar procesos de bun/next si siguen corriendo
  pkill -f "bun.*src/index.ts" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true

  log "Todo detenido"
}

show_status() {
  load_env_dev_optional
  info "Estado del entorno de desarrollo:"
  echo ""

  # Docker
  if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    log "Docker: corriendo"
  else
    err "Docker: no disponible"
  fi

  # PostgreSQL
  if try_resolve_compose_cmd && compose -f docker-compose.dev.yml ps --status running 2>/dev/null | grep -q postgres; then
    log "PostgreSQL: corriendo en localhost:${POSTGRES_PORT}"
  else
    warn "PostgreSQL: detenido"
  fi

  # MC containers
  local mc_count
  mc_count=$(docker ps --filter "label=mc-panel.managed=true" -q 2>/dev/null | wc -l)
  log "Servidores MC corriendo: $mc_count"

  # API process
  if pgrep -f "bun.*src/index.ts" &>/dev/null; then
    log "API: corriendo en http://localhost:3001"
  else
    warn "API: no corriendo"
  fi

  # Panel process
  if pgrep -f "next dev" &>/dev/null; then
    log "Panel: corriendo en http://localhost:3000"
  else
    warn "Panel: no corriendo"
  fi
}

load_env_dev() {
  if [ ! -f "$ROOT_DIR/.env.dev" ]; then
    err "No existe $ROOT_DIR/.env.dev"
    err "Copia .env.example a .env.dev y completa las variables necesarias."
    exit 1
  fi
  set -a
  source "$ROOT_DIR/.env.dev"
  set +a
  apply_db_env_defaults
}

verify_postgres_credentials() {
  if ! compose -f docker-compose.dev.yml exec -T \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    postgres psql -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null 2>&1; then
    err "PostgreSQL levantó, pero falló autenticación con las credenciales de dev."
    err "Credenciales actuales esperadas:"
    err "  POSTGRES_USER=$POSTGRES_USER"
    err "  POSTGRES_DB=$POSTGRES_DB"
    err "  POSTGRES_PASSWORD=<oculto>"
    err "Esto suele pasar cuando el volumen postgres-dev-data fue creado con otra contraseña."
    err "Si estás en modo dev y puedes borrar datos, ejecuta:"
    err "  ./dev.sh reset-db"
    exit 1
  fi
}

reset_db() {
  load_env_dev_optional
  check_docker
  warn "Reiniciando PostgreSQL dev: se eliminará el volumen postgres-dev-data."
  compose -f docker-compose.dev.yml down -v --remove-orphans
  start_db
  log "PostgreSQL dev reiniciado con credenciales actuales."
}

# ── Main ─────────────────────────────────────────────────────────────────────

CMD="${1:-all}"

case "$CMD" in
  check)
    check_system_prereqs
    ;;
  install)
    warn "El comando 'install' está deprecado: ya no se instalan prerequisitos automáticamente."
    check_system_prereqs
    ;;
  db)
    start_db
    ;;
  reset-db)
    reset_db
    ;;
  mc-build)
    build_mc_image
    ;;
  api)
    start_api
    ;;
  panel)
    start_panel
    ;;
  stop)
    stop_all
    ;;
  status)
    show_status
    ;;
  all)
    # Validar prerequisitos del sistema
    check_system_prereqs

    # Crear directorios de datos
    mkdir -p data/servers data/backups logs

    start_db
    build_mc_image
    install_and_migrate_api
    install_panel

    log ""
    log "==========================================="
    log "  Entorno de desarrollo listo"
    log "==========================================="
    log ""
    log "  Ahora abre DOS terminales:"
    log ""
    log "  Terminal 1 (API):"
    log "    cd $(pwd) && ./dev.sh api"
    log ""
    log "  Terminal 2 (Frontend):"
    log "    cd $(pwd) && ./dev.sh panel"
    log ""
    log "  Panel:     http://localhost:3000"
    log "  API:       http://localhost:3001"
    log "  Login:     admin / admin123"
    log ""
    log "  Ver estado: ./dev.sh status"
    log "  Detener:    ./dev.sh stop"
    log "==========================================="
    ;;
  *)
    echo "Uso: ./dev.sh [all|db|reset-db|mc-build|api|panel|stop|status|check]"
    echo ""
    echo "Comandos:"
    echo "  all       Levanta todo (por defecto)"
    echo "  check     Valida prerequisitos (Docker, Compose, Bun, Node.js, npm)"
    echo "  db        Solo PostgreSQL"
    echo "  reset-db  Reinicia PostgreSQL dev (borra datos del volumen)"
    echo "  mc-build  Solo rebuild imagen Minecraft"
    echo "  api       Solo la API (asume DB corriendo)"
    echo "  panel     Solo el frontend (asume API corriendo)"
    echo "  status    Muestra estado de los servicios"
    echo "  stop      Detiene todo"
    exit 1
    ;;
esac
