# MC Server Stack — Frontend

Dashboard web para gestionar servidores de Minecraft. Consume la API del backend.

**Stack:** React 19 · TypeScript · Vite · React Router 7 · Tailwind CSS v4 · lucide-react · Vitest + Testing Library

> **UI:** tema oscuro "glass" sobre Tailwind v4 con primitivos propios en
> `shared/components/ui/` (`Button`, `Card`, `Field`) e iconos `lucide-react`.

> Arquitectura DDD / Clean Architecture, espejo del backend: cada feature es un
> módulo con capas `domain → application → infrastructure` + UI
> (`hooks`, `components` presentadores, `containers`). El contrato con la API es
> **camelCase**.

---

## Requisitos

- [Bun](https://bun.sh) >= 1.3
- Backend corriendo (por defecto en `:3000`)

---

## Comandos

```bash
bun install          # desde la raíz del monorepo instala todos los workspaces
bun run dev          # Vite dev server en :5173 (proxy /api -> :3000)
bun run build        # tsc && vite build (única etapa donde se typechea)
bun run preview      # sirve el build de producción
bun run test         # vitest run
bun run test:watch   # vitest en modo watch
```

---

## Arquitectura

```
src/
├── modules/
│   ├── server/        # listado, detalle, crear (edición Java/Bedrock + propiedades MC), editar props, acciones
│   ├── auth/          # login, sesión (AuthContext), ProtectedRoute
│   ├── backup/        # crear (local/nube) / restaurar / borrar + plan automático
│   ├── console/       # logs + comando + stream en vivo (WebSocket); solo lectura en Bedrock
│   └── system/        # capacidad del host (HostCapacityCard, useHostResources)
│       ├── domain/          # entidades, value objects, puertos (interfaces)
│       ├── application/     # casos de uso + factory
│       ├── infrastructure/  # HttpXRepository sobre apiFetch
│       ├── hooks/           # hooks que envuelven el factory (loading/error)
│       ├── components/      # presentadores (puros, render por props)
│       ├── containers/      # orquestan hooks + estado, eligen qué renderizar
│       └── test/            # mothers + tests
├── shared/components/  # UI genérica (Layout, Spinner, ConfirmDialog, NotFound)
│   └── ui/             # primitivos del design-system (Button, Card, Field)
├── shared/lib/cn.ts    # helper de classnames (sin dependencias)
├── api/client.ts       # apiFetch: añade el bearer token y redirige a /login en 401
├── test/setup.ts       # setup de Vitest (jest-dom + stub scrollIntoView)
└── main.tsx            # router + providers
```

Reglas:
- **domain**: entidades / value objects inmutables (p.ej. `ServerStatus` con sus
  guards `canStart` / `canStopOrRestart` / `isTransitioning`) y *puertos*.
- **application**: casos de uso + `factory` que cablea el `HttpXRepository`.
- **infrastructure**: `HttpServerRepository`, `HttpAdminRepository`,
  `HttpBackupRepository`, `HttpConsoleRepository` — todos reusan `api/client.ts#apiFetch`.
- **container / presenter**: el container llama hooks y maneja estado; el
  presentador es puro y recibe datos + callbacks por props.

> **Gotcha (`tsconfig`):** `erasableSyntaxOnly: true` prohíbe *parameter
> properties* en constructores. Declara los campos y asígnalos en el cuerpo.

---

## Consola en tiempo real (WebSocket)

El stream de logs en vivo se conecta a `/ws/servers/:id?token=<JWT>` (mismo
origen). En **producción** nginx hace proxy de `/ws` al backend; el proxy del
**dev server de Vite solo reenvía `/api`, no `/ws`**, así que el stream en vivo no
funciona vía `vite dev` (el seed inicial por `GET /logs` sí). El token se toma de
`localStorage`.

---

## Tests

Vitest + React Testing Library + jsdom. La unidad de test es el **caso de uso**;
los repositorios se mockean con un `RepositoryMother` y los datos vienen de un
**Object Mother** (`@faker-js/faker`). Los presentadores se testean con RTL usando
queries accesibles (nunca clases CSS). La infraestructura (`HttpXRepository`,
WebSocket) no se testea.

```bash
bun run test                                          # toda la suite
bun run test src/modules/server/test/application      # un directorio
```

Los mothers viven en `src/modules/<mod>/test/helpers/` y los tests en
`src/modules/<mod>/test/{application,domain,components}/`.
