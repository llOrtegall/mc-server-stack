#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Levanta el entorno de desarrollo local en WSL
#
# Requisitos:
#   - Docker corriendo en WSL (docker desktop o dockerd)
#   - Bun instalado (curl -fsSL https://bun.sh/install | bash)
#   - Node.js 20+ (para Next.js)
#
# Uso:
#   ./dev.sh          → levanta todo (DB + build MC image + API + frontend)
#   ./dev.sh db       → solo PostgreSQL
#   ./dev.sh api      → solo la API (asume DB ya corre)
#   ./dev.sh panel    → solo el frontend (asume API ya corre)
#   ./dev.sh mc-build → solo rebuild de la imagen Minecraft
#   ./dev.sh stop     → detiene todo
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

log()  { echo -e "${GREEN}[dev]${NC} $*"; }
warn() { echo -e "${YELLOW}[dev]${NC} $*"; }
err()  { echo -e "${RED}[dev]${NC} $*" >&2; }

# ── Funciones ────────────────────────────────────────────────────────────────

start_db() {
  log "Levantando PostgreSQL..."
  docker compose -f docker-compose.dev.yml up -d

  log "Esperando a que PostgreSQL esté listo..."
  until docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mcadmin -d mcpanel &>/dev/null; do
    sleep 1
  done
  log "PostgreSQL listo en localhost:5432"
}

build_mc_image() {
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

  # Exportar variables del frontend
  export NEXT_PUBLIC_API_URL=http://localhost:3001
  export NEXT_PUBLIC_WS_URL=http://localhost:3001

  log "Iniciando mc-panel en http://localhost:3000"
  npm run dev
}

stop_all() {
  log "Deteniendo PostgreSQL..."
  docker compose -f docker-compose.dev.yml down

  log "Deteniendo contenedores Minecraft..."
  docker ps --filter "label=mc-panel.managed=true" -q | xargs -r docker stop 2>/dev/null || true

  # Matar procesos de bun/next si siguen corriendo
  pkill -f "bun.*src/index.ts" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true

  log "Todo detenido"
}

# ── Main ─────────────────────────────────────────────────────────────────────

CMD="${1:-all}"

case "$CMD" in
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
  all)
    # Crear directorios de datos
    mkdir -p data/servers data/backups

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
    log "  Para detener todo:  ./dev.sh stop"
    log "==========================================="
    ;;
  *)
    echo "Uso: ./dev.sh [db|mc-build|api|panel|stop|all]"
    exit 1
    ;;
esac
