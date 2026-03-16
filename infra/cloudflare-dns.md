# Configuración DNS en Cloudflare para lortegal.com

## Registros a crear

Ve a **dash.cloudflare.com → lortegal.com → DNS → Records**

| Tipo | Nombre | Contenido | TTL | Proxy |
|------|--------|-----------|-----|-------|
| A | `panel` | `<IP_VPS>` | Auto | ☁️ Proxy activo |
| A | `api` | `<IP_VPS>` | Auto | ☁️ Proxy activo |
| A | `vps` | `<IP_VPS>` | Auto | ☁️ DNS solo (gris) |
| SRV | `_minecraft._tcp.mine` | Ver abajo | Auto | — |

## Cómo crear el SRV record para Minecraft

El SRV record permite que los jugadores se conecten escribiendo `mine.lortegal.com`
sin necesidad de especificar el puerto `:25565`.

En Cloudflare, al crear un SRV record:
- **Type**: SRV
- **Name**: `_minecraft._tcp.mine`
- **Service**: `_minecraft`
- **Proto**: `_tcp`
- **Name** (del target): `mine`
- **Priority**: 0
- **Weight**: 5
- **Port**: 25565
- **Target**: `vps.lortegal.com` ← apunta al registro A gris que creaste arriba

> **Por qué usar `vps.lortegal.com` como target?**
> El SRV record apunta a un hostname, no a una IP directamente.
> Ese hostname (`vps.lortegal.com`) tiene el proxy de Cloudflare DESACTIVADO (nube gris),
> por lo que expone la IP real del VPS. Cloudflare NO puede proxear el tráfico TCP de Minecraft.

## Firewall del VPS (UFW)

Ejecuta en el VPS para abrir solo los puertos necesarios:

```bash
# SSH (ya debería estar abierto)
sudo ufw allow 22/tcp

# HTTP/HTTPS para Nginx Proxy Manager
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Nginx Proxy Manager Admin (solo acceso local o VPN — NO exponer públicamente)
# sudo ufw allow from TU_IP to any port 81

# Minecraft
sudo ufw allow 25565/tcp

# Activar firewall
sudo ufw enable
sudo ufw status
```

## Verificación

Después de aplicar los DNS (puede tardar 1-5 min con Cloudflare):

```bash
# Verificar que el panel resuelve
curl -I https://panel.lortegal.com

# Verificar que la API responde
curl https://api.lortegal.com/health

# Verificar SRV record de Minecraft
dig SRV _minecraft._tcp.mine.lortegal.com
# Debe mostrar: 0 5 25565 vps.lortegal.com.
```

## Seguridad adicional con Cloudflare

Para `panel.lortegal.com` y `api.lortegal.com` (con proxy activo):

1. **SSL/TLS → Full (strict)** en Cloudflare para cifrado end-to-end
2. **Security → WAF** → activar "Cloudflare Managed Ruleset"
3. **Security → Bot Fight Mode** → activar
4. **Speed → Auto Minify** → activar para JS/CSS/HTML del panel
