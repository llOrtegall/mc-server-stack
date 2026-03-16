# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: downloader
# Descarga el jar de Minecraft para la versión solicitada usando la
# Mojang Version Manifest API. Separado para aprovechar el cache de Docker
# cuando solo cambia el runtime, no la versión.
# ─────────────────────────────────────────────────────────────────────────────
FROM alpine:3.19 AS downloader

ARG MC_VERSION=1.21

RUN apk add --no-cache curl jq

# Mojang Version Manifest v2 — obtiene la URL del server jar para la versión
RUN MANIFEST_URL="https://piston-meta.mojang.com/mc/game/version_manifest_v2.json" && \
    VERSION_URL=$(curl -sf "$MANIFEST_URL" | \
      jq -r --arg v "$MC_VERSION" '.versions[] | select(.id == $v) | .url') && \
    if [ -z "$VERSION_URL" ]; then \
      echo "ERROR: Version $MC_VERSION not found in Mojang manifest" && exit 1; \
    fi && \
    SERVER_URL=$(curl -sf "$VERSION_URL" | jq -r '.downloads.server.url') && \
    echo "Downloading Minecraft $MC_VERSION server..." && \
    curl -fL -o /server.jar "$SERVER_URL" && \
    echo "Download complete: $(du -sh /server.jar | cut -f1)"

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: runtime
# Imagen final mínima con JRE + jar descargado.
# Soporta 1.16 (Java 16) y 1.17+ (Java 21).
# En producción se usa una sola imagen por servidor con la versión fijada.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Metadatos
LABEL org.opencontainers.image.title="mc-server" \
      org.opencontainers.image.description="Optimized Minecraft Vanilla server" \
      mc.version="${MC_VERSION}"

# Dependencias mínimas del OS
RUN apk add --no-cache \
    bash \
    curl \
    tini

# Usuario no-root para seguridad
RUN addgroup -S minecraft && adduser -S -G minecraft minecraft

WORKDIR /minecraft

# Copiar jar desde el stage anterior
COPY --from=downloader --chown=minecraft:minecraft /server.jar ./server.jar

# Script de inicio
COPY --chown=minecraft:minecraft entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Variables de entorno con defaults seguros
ENV MC_MEMORY=1024M \
    MC_VERSION=1.21 \
    SERVER_PORT=25565 \
    RCON_PORT=25575 \
    RCON_PASSWORD=changeme \
    MAX_PLAYERS=20 \
    MOTD="Minecraft Server" \
    DIFFICULTY=normal \
    GAMEMODE=survival \
    ONLINE_MODE=true \
    VIEW_DISTANCE=10 \
    SIMULATION_DISTANCE=10

# Exponer puertos del servidor y RCON
EXPOSE ${SERVER_PORT} ${RCON_PORT}

# Volumen para persistir el mundo y configuración
VOLUME ["/minecraft/world", "/minecraft/logs"]

# tini como PID 1 para manejo correcto de señales (SIGTERM → /stop)
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./entrypoint.sh"]

USER minecraft
