#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# MC Server Entrypoint
# 1. Acepta EULA
# 2. Genera server.properties con RCON habilitado
# 3. Lanza JVM con Aikar's flags optimizados
# 4. Graceful shutdown vía SIGTERM → comando /stop
# ─────────────────────────────────────────────────────────────────────────────

MC_DIR="/minecraft"

log() {
  echo "[mc-entrypoint] $*"
}

# ── 1. Aceptar EULA automáticamente ───────────────────────────────────────
if [ ! -f "$MC_DIR/eula.txt" ] || ! grep -q "eula=true" "$MC_DIR/eula.txt"; then
  log "Aceptando EULA de Minecraft..."
  echo "eula=true" > "$MC_DIR/eula.txt"
fi

# ── 2. Generar server.properties si no existe ─────────────────────────────
PROPS="$MC_DIR/server.properties"

if [ ! -f "$PROPS" ]; then
  log "Generando server.properties..."
  cat > "$PROPS" <<EOF
# Generado automáticamente por mc-server entrypoint
# Edita desde el panel web para cambiar configuración

server-port=${SERVER_PORT}
server-ip=

# RCON — NO deshabilitar, el panel lo usa para comunicación
enable-rcon=true
rcon.port=${RCON_PORT}
rcon.password=${RCON_PASSWORD}

# Configuración del servidor
max-players=${MAX_PLAYERS}
motd=${MOTD}
difficulty=${DIFFICULTY}
gamemode=${GAMEMODE}
online-mode=${ONLINE_MODE}
view-distance=${VIEW_DISTANCE}
simulation-distance=${SIMULATION_DISTANCE}

# Rendimiento
network-compression-threshold=256
use-native-transport=true

# Seguridad
enforce-secure-profile=false
prevent-proxy-connections=false

# Spawn
spawn-protection=16
spawn-monsters=true
spawn-animals=true
spawn-npcs=true

# Mundo
level-name=world
level-type=minecraft\:normal
generate-structures=true
allow-nether=true
EOF
else
  # Si ya existe, solo actualizar RCON (puede haber cambiado la password)
  sed -i "s/^rcon.password=.*/rcon.password=${RCON_PASSWORD}/" "$PROPS"
  sed -i "s/^rcon.port=.*/rcon.port=${RCON_PORT}/" "$PROPS"
  sed -i "s/^enable-rcon=.*/enable-rcon=true/" "$PROPS"
fi

# ── 3. Calcular flags JVM optimizados (Aikar's flags) ─────────────────────
# Extraer el número de MB de MC_MEMORY (ej: "1024M" → "1024", "2G" → "2048")
MEM_VALUE="${MC_MEMORY%[MmGg]}"
MEM_UNIT="${MC_MEMORY: -1}"
if [[ "$MEM_UNIT" == "G" || "$MEM_UNIT" == "g" ]]; then
  MEM_MB=$(( MEM_VALUE * 1024 ))
else
  MEM_MB="$MEM_VALUE"
fi

# Usar G1GC para heaps > 12GB, ZGC para >= 12GB (más pausas bajas)
if (( MEM_MB >= 12288 )); then
  GC_FLAGS="-XX:+UseZGC -XX:+ZGenerational"
else
  GC_FLAGS="-XX:+UseG1GC \
    -XX:+ParallelRefProcEnabled \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+DisableExplicitGC \
    -XX:+AlwaysPreTouch \
    -XX:G1NewSizePercent=30 \
    -XX:G1MaxNewSizePercent=40 \
    -XX:G1HeapRegionSize=8M \
    -XX:G1ReservePercent=20 \
    -XX:G1HeapWastePercent=5 \
    -XX:G1MixedGCCountTarget=4 \
    -XX:InitiatingHeapOccupancyPercent=15 \
    -XX:G1MixedGCLiveThresholdPercent=90 \
    -XX:G1RSetUpdatingPauseTimePercent=5 \
    -XX:SurvivorRatio=32 \
    -XX:+PerfDisableSharedMem \
    -XX:MaxTenuringThreshold=1"
fi

JVM_FLAGS="-Xms${MC_MEMORY} -Xmx${MC_MEMORY} \
  $GC_FLAGS \
  -Dusing.aikars.flags=https://mcflags.emc.gs \
  -Daikars.new.flags=true \
  -Dfile.encoding=UTF-8 \
  --add-modules=ALL-SYSTEM"

log "Iniciando Minecraft ${MC_VERSION} con ${MC_MEMORY} de RAM..."
log "JVM flags: $JVM_FLAGS"

# ── 4. Graceful shutdown ──────────────────────────────────────────────────
# Al recibir SIGTERM, enviar /stop al servidor en lugar de matar el proceso
cleanup() {
  log "Recibida señal de apagado, enviando /stop al servidor..."
  if command -v java &>/dev/null && kill -0 "$MC_PID" 2>/dev/null; then
    # Enviar /stop via stdin del proceso Java
    echo "/stop" >&"${JAVA_STDIN_FD:-/dev/null}" 2>/dev/null || true
    # Dar 30 segundos al servidor para guardar el mundo
    wait "$MC_PID" 2>/dev/null || true
  fi
  log "Servidor apagado correctamente."
  exit 0
}

trap cleanup SIGTERM SIGINT

# ── 5. Iniciar servidor ───────────────────────────────────────────────────
cd "$MC_DIR"

# shellcheck disable=SC2086
exec java $JVM_FLAGS -jar server.jar --nogui &
MC_PID=$!

log "Servidor iniciado con PID $MC_PID"
wait "$MC_PID"
