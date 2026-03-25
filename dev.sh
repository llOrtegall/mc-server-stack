#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Levanta el entorno de desarrollo local en WSL (Ubuntu 24)
#
# Instala dependencias automaticamente (Bun, Node.js 20, etc.)
# Docker y Docker Compose deben estar instalados previamente.
#
# Uso:
#   ./dev.sh          → levanta todo (DB + build MC image + API + frontend)
#   ./dev.sh db       → solo PostgreSQL
#   ./dev.sh api      → solo la API (asume DB ya corre)
#   ./dev.sh panel    → solo el frontend (asume API ya corre)
#   ./dev.sh mc-build → solo rebuild de la imagen Minecraft
#   ./dev.sh stop     → detiene todo
#   ./dev.sh install  → solo instala dependencias del sistema
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
}

install_bun() {
  if command -v bun &>/dev/null; then
    log "Bun ya instalado: $(bun --version)"
    return
  fi
  warn "Bun no encontrado, instalando..."
  curl -fsSL https://bun.sh/install | bash
  # Cargar bun en la sesion actual
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  log "Bun instalado: $(bun --version)"
}

install_node() {
  if command -v node &>/dev/null; then
    local node_version
    node_version=$(node --version | sed 's/v//' | cut -d. -f1)
    if (( node_version >= 24 )); then
      log "Node.js ya instalado: $(node --version)"
      return
    fi
    warn "Node.js $(node --version) detectado, se necesita v24+"
  fi
  warn "Instalando Node.js 24 via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
  log "Node.js instalado: $(node --version)"
}

install_system_deps() {
  log "Verificando dependencias del sistema..."
  check_docker
  install_bun
  install_node
  log "Todas las dependencias del sistema listas"
}

# ── Funciones ────────────────────────────────────────────────────────────────

start_db() {
  check_docker
  log "Levantando PostgreSQL..."
  docker compose -f docker-compose.dev.yml up -d

  log "Esperando a que PostgreSQL esté listo..."
  local attempts=0
  until docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mcadmin -d mcpanel &>/dev/null; do
    sleep 1
    ((attempts++))
    if (( attempts > 30 )); then
      err "PostgreSQL no respondió tras 30 segundos"
      exit 1
    fi
  done
  log "PostgreSQL listo en localhost:5432"
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
  set -a
  source "$ROOT_DIR/.env.dev"
  set +a
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

  set -a
  source "$ROOT_DIR/.env.dev"
  set +a

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

  # PostgreSQL
  if docker compose -f docker-compose.dev.yml ps --status running 2>/dev/null | grep -q postgres; then
    docker compose -f docker-compose.dev.yml down
    log "PostgreSQL detenido"
  fi

  # Contenedores Minecraft
  local mc_containers
  mc_containers=$(docker ps --filter "label=mc-panel.managed=true" -q 2>/dev/null || true)
  if [ -n "$mc_containers" ]; then
    echo "$mc_containers" | xargs docker stop 2>/dev/null || true
    log "Contenedores Minecraft detenidos"
  fi

  # Matar procesos de bun/next si siguen corriendo
  pkill -f "bun.*src/index.ts" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true

  log "Todo detenido"
}

show_status() {
  info "Estado del entorno de desarrollo:"
  echo ""

  # Docker
  if docker info &>/dev/null 2>&1; then
    log "Docker: corriendo"
  else
    err "Docker: no disponible"
  fi

  # PostgreSQL
  if docker compose -f docker-compose.dev.yml ps --status running 2>/dev/null | grep -q postgres; then
    log "PostgreSQL: corriendo en localhost:5432"
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

# ── Main ─────────────────────────────────────────────────────────────────────

CMD="${1:-all}"

case "$CMD" in
  install)
    install_system_deps
    ;;
  db)
    start_db
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
    # Instalar dependencias del sistema si faltan
    install_system_deps

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
    echo "Uso: ./dev.sh [all|db|mc-build|api|panel|stop|status|install]"
    echo ""
    echo "Comandos:"
    echo "  all       Levanta todo (por defecto)"
    echo "  install   Solo instala Bun + Node.js"
    echo "  db        Solo PostgreSQL"
    echo "  mc-build  Solo rebuild imagen Minecraft"
    echo "  api       Solo la API (asume DB corriendo)"
    echo "  panel     Solo el frontend (asume API corriendo)"
    echo "  status    Muestra estado de los servicios"
    echo "  stop      Detiene todo"
    exit 1
    ;;
esac
