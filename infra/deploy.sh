#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Script de despliegue inicial en el VPS
# Ejecutar UNA sola vez después de clonar el repositorio
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

log() { echo -e "\033[1;32m[deploy]\033[0m $*"; }
err() { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; exit 1; }

# ── Verificar requisitos ─────────────────────────────────────────────────────
command -v docker &>/dev/null || err "Docker no instalado"
command -v docker compose &>/dev/null || err "Docker Compose v2 no instalado"

# ── Verificar .env ──────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  err "Falta el archivo .env. Copia .env.example → .env y rellena los valores."
fi

# ── Crear directorios necesarios ─────────────────────────────────────────────
log "Creando directorios de datos..."
mkdir -p data/servers logs

# ── Build imagen Minecraft ────────────────────────────────────────────────────
log "Construyendo imagen Docker de Minecraft (puede tardar unos minutos)..."
docker build \
  --build-arg MC_VERSION=1.21 \
  -t mc-server:latest \
  ./docker/minecraft/

# ── Build servicios ───────────────────────────────────────────────────────────
log "Construyendo imágenes de los servicios..."
docker compose build --parallel

# ── Levantar infra base primero ───────────────────────────────────────────────
log "Levantando PostgreSQL y Redis..."
docker compose up -d postgres redis

log "Esperando a que PostgreSQL esté listo..."
until docker compose exec postgres pg_isready -U "${POSTGRES_USER:-mcadmin}" &>/dev/null; do
  sleep 2
done
log "PostgreSQL listo."

# ── Ejecutar migraciones ──────────────────────────────────────────────────────
log "Ejecutando migraciones de base de datos..."
docker compose run --rm mc-api bun src/infrastructure/persistence/migrate.ts

# ── Levantar todos los servicios ──────────────────────────────────────────────
log "Levantando todos los servicios..."
docker compose up -d

log ""
log "✅ Deploy completado!"
log ""
log "Servicios corriendo:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
log ""
log "Pasos siguientes:"
log "1. Accede a Nginx Proxy Manager en http://TU_IP_VPS:81"
log "   - Email: admin@example.com / Password: changeme (cambiar en primer login)"
log "2. Configura los proxy hosts:"
log "   - panel.lortegal.com → mc-panel:3000"
log "   - api.lortegal.com   → mc-api:3001"
log "3. Activa SSL con Let's Encrypt para ambos dominios"
log "4. Configura los DNS en Cloudflare (ver infra/cloudflare-dns.md)"
