# MC Server Stack

Una plataforma completa para gestionar servidores de Minecraft usando Docker. Inspirado en Aternos, permite crear, administrar y monitorear servidores de Minecraft de forma sencilla a través de una interfaz web.

## 🚀 Características

- **Gestión de Servidores**: Crear, iniciar, detener y eliminar servidores de Minecraft
- **Consola en Tiempo Real**: Acceso a la consola del servidor vía WebSocket
- **Backups Automáticos**: Respaldos a Cloudflare R2 o AWS S3
- **Autenticación**: Sistema de usuarios con JWT
- **Interfaz Web Moderna**: Dashboard responsivo con React y Tailwind CSS
- **API REST**: Backend completo con documentación
- **Docker Nativo**: Servidores corriendo en contenedores Docker
- **Watchdog**: Monitoreo automático del estado de los servidores

## 🛠️ Stack Tecnológico

### Backend
- **Bun** - Runtime JavaScript rápido
- **TypeScript** - Tipado estático
- **Express v5** - Framework web
- **PostgreSQL** - Base de datos
- **Dockerode** - API de Docker
- **WebSocket** - Consola en tiempo real
- **JWT** - Autenticación
- **Zod** - Validación de datos

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Enrutamiento

### DevOps
- **Docker & Docker Compose** - Contenerización
- **Biome** - Linting y formateo
- **Lefthook** - Git hooks

## 📋 Prerrequisitos

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://docker.com) con socket accesible
- [Docker Compose](https://docs.docker.com/compose/)
- PostgreSQL (o usar la imagen incluida)
- Bucket en Cloudflare R2 o AWS S3 para backups

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/llortegall/mc-server-stack.git
cd mc-server-stack
```

### 2. Instalar dependencias

```bash
bun install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Variables requeridas:

```env
# Base de datos
POSTGRES_USER=mcstack
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=mcstack

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro
JWT_EXPIRES_IN=7d

# Docker
MC_DATA_PATH=/data/mc-servers

# R2/S3 Backups
R2_ENDPOINT=https://<tu-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET=mc-backups

# Admin inicial
ADMIN_EMAIL=admin@minecraft.local
ADMIN_PASSWORD=cambiar_esto_123
```

### 4. Levantar los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en el puerto 5432
- Backend API en el puerto 3000
- Frontend en el puerto 80

## 💻 Desarrollo

### Backend

```bash
# Instalar dependencias
cd backend
bun install

# Ejecutar en modo desarrollo
bun run dev

# Tests
bun run test

# Linting y formateo
bun run lint
bun run format
```

### Frontend

```bash
# Instalar dependencias
cd frontend
bun install

# Ejecutar en modo desarrollo
bun run dev

# Build para producción
bun run build
```

### Comandos raíz

```bash
# Formatear todo el proyecto
bun run format

# Linting de todo el proyecto
bun run lint

# Tests del backend
bun run test
```

## 🔧 Uso

### Acceso a la aplicación

1. Abre tu navegador en `http://localhost`
2. Inicia sesión con las credenciales del admin inicial
3. Crea tu primer servidor de Minecraft

### API Endpoints

La API está disponible en `http://localhost:3000/api`

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

#### Servidores
- `GET /api/servers` - Listar servidores
- `POST /api/servers` - Crear servidor
- `GET /api/servers/:id` - Detalles del servidor
- `PUT /api/servers/:id` - Actualizar servidor
- `DELETE /api/servers/:id` - Eliminar servidor
- `POST /api/servers/:id/start` - Iniciar servidor
- `POST /api/servers/:id/stop` - Detener servidor

#### Consola
- `WebSocket /ws/servers/:id?token=JWT` - Conexión WebSocket para consola

#### Backups
- `GET /api/servers/:id/backups` - Listar backups
- `POST /api/servers/:id/backups` - Crear backup
- `POST /api/servers/:id/backups/:backupId/restore` - Restaurar backup

## 🐳 Despliegue

### Usando Docker Compose (Recomendado)

```bash
# Construir imágenes personalizadas (opcional)
docker-compose build

# Levantar en producción
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Variables de entorno para producción

Asegúrate de configurar estas variables adicionales:

```env
NODE_ENV=production
PORT=3000
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de desarrollo

- Usa TypeScript en modo estricto
- Ejecuta `bun run check` antes de commitear
- Los commits siguen [Conventional Commits](https://conventionalcommits.org/)
- Las PRs requieren aprobación de al menos un maintainer

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Inspirado en [Aternos](https://aternos.org) por la idea original
- [Dockerode](https://github.com/apocas/dockerode) por la integración con Docker
- La comunidad de Minecraft por mantener vivo el juego

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los [issues](https://github.com/llortegall/mc-server-stack/issues) existentes
2. Crea un nuevo issue con detalles completos
3. Incluye logs, configuración y pasos para reproducir

---

**¡Disfruta administrando tus servidores de Minecraft! 🎮**</content>
<parameter name="filePath">/home/ortega/projects/mc-server-stack/README.md