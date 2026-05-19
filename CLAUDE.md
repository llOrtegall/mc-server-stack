# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Aternos-style web platform for provisioning and managing Minecraft servers. The backend spawns one Docker container per Minecraft server (using the `itzg/minecraft-server` image) by talking to the host Docker daemon. A React dashboard drives it. See `README.md` (Spanish), `backend/README.md` and `frontend/README.md` for the full feature list and exhaustive API/env-var reference — don't duplicate those here.

## Repo layout

Bun **workspaces** monorepo: `backend` (Bun + Express API) and `frontend` (Vite + React). Root config (`biome.json`, `lefthook.yml`, root `package.json`) governs both.

Both apps follow the same **DDD / Clean Architecture** layering — every feature is a module under `src/modules/<context>/` with `domain → application → infrastructure → interface` (backend) / `+ hooks/components/containers` (frontend). The personal architecture, testing, git and API agreements live in `~/.claude/docs/` (`ddd-clean-architecture.md`, etc.) and govern this repo.

## Commands

Run from the repo root unless noted:

```bash
bun install              # installs all workspaces
bun run dev:backend      # API on :3000 (runs backend/src/index.ts directly via Bun)
bun run dev:frontend     # Vite dev server on :5173, proxies /api -> :3000
bun run check            # biome check --write . (lint + format + organize imports)
bun run lint             # biome lint --write .
bun run format           # biome format --write .
bun run test             # backend test suite (delegates to backend)
```

Backend tests use `bun test`. Run a single file or filter by name:

```bash
cd backend && bun test src/modules/server/test/application/createServer.test.ts
cd backend && bun test -t "createServer"
```

Frontend has a **Vitest** suite: `cd frontend && bun run test` (`bun run test:watch` for watch mode). The frontend is typechecked only through its build: `cd frontend && bun run build` (`tsc && vite build`).

Git hooks (lefthook): pre-commit runs Biome format+lint on staged files; **pre-push runs `bun test` in `backend`**. CI (`deploy.yml`) runs both backend and frontend tests before building images.

## Backend architecture

Bun runtime, Express **v5**. The entrypoint `backend/src/index.ts` runs the source directly — there is no build/transpile step (`tsconfig` is `noEmit`).

- **Module pattern (DDD):** every feature is a module `backend/src/modules/<context>/` with layers `domain → application → infrastructure → interface` (+ `test`). Contexts: `server`, `auth`, `backup`, `console`. Dependencies always point inward.
  - **domain**: entities + value objects (immutable, self-validating) + `*List` collections + *ports* (repository/service interfaces). No external deps. Entities expose `toPrimitive()` (full camelCase shape incl. secrets) and `toPublic()` (strips secrets like `rconPassword`).
  - **application**: use cases (one function per operation, deps passed in) + a `factory.ts` that wires use cases to concrete infrastructure. Use cases throw plain `Error` prefixed `[useCaseName]`.
  - **infrastructure**: concrete adapters implementing the domain ports — `PostgresXRepository`, `S3BackupStorage`, `TarBackupArchiver`, `DockerServerRuntime`, `RconConsoleGateway`, `DockerLogReader`, `WsLogStream`. Postgres repos alias snake_case columns to camelCase in SQL (`rcon_port AS "rconPort"`).
  - **interface**: `*.controller.ts` (parse/validate with Zod, map known `Error`s to `AppError`/status) + `*.router.ts`.
- **Nested routers** (`console`, `backup`) are mounted under `/api/servers/:id/...` and use `Router({ mergeParams: true })` so they can read `req.params.id`. Replicate this for any router mounted on a parameterized path.
- **Errors:** throw `new AppError(statusCode, message)` (from `middleware/error.middleware.ts`) anywhere in the interface layer. Controllers wrap handlers in try/catch → `next(toAppError(err))`; `errorMiddleware` renders `AppError` as `{ error }` with its status, anything else as a 500. Express 5 does *not* auto-forward async rejections, so the explicit `try/catch → next(err)` is mandatory. Domain/application stay HTTP-agnostic.
- **Config:** `config.ts` validates required env vars at import time via `requireEnv` — a missing var crashes the process on boot. Add new required env there.
- **DB:** a single `pg.Pool`, **raw parameterized SQL** (no ORM), used only inside `Postgres*Repository` infrastructure classes. Migrations are *not* a framework: `db/index.ts#migrate()` reads exactly one file, `db/migrations/001_initial.sql`, on every boot. That file is idempotent (`CREATE ... IF NOT EXISTS`). Schema changes must either be folded into that file idempotently or you must also wire up the new file in `migrate()`.
- **Auth:** single-admin model. There is **no registration endpoint** — only `POST /api/auth/login` and `GET /api/auth/me`. On first boot `authFactory.createAdminIfNone` seeds one admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if the `admins` table is empty. `authMiddleware` (in `middleware/`, uses `jwt` directly) verifies the JWT bearer token and sets `req.adminId`.

## How Minecraft servers actually run (the core model)

- `docker/docker.service.ts` wraps `dockerode` against the host Docker socket (`DOCKER_SOCKET`); the `server` module reaches it behind the `ServerRuntime` port (`DockerServerRuntime`). The backend is effectively orchestrating sibling containers on the host daemon, not a nested daemon.
- Each server → one container `mc-server-{uuid}` from `itzg/minecraft-server`, with `EULA=TRUE`, `TYPE=VANILLA`, memory/CPU limits, and RCON enabled.
- **Data persistence & the path gotcha:** server data lives at `MC_DATA_PATH/{id}` and is bind-mounted to the container's `/data`. That bind path is resolved by the *host* daemon, so `MC_DATA_PATH` must be a real host path. In docker-compose the same host path (`/data/mc-servers`) is mounted into the backend container at the identical location so both the daemon and the backend agree. Don't assume it's a path inside the backend container.
- **Ports:** the Minecraft port is user-chosen; the RCON port is derived as `port + 1`. Inside the container RCON is fixed at 25575 and published to the host's `rcon_port`. A random hex `rcon_password` is generated at create time and stored in the DB (never exposed via the API).
- **Status** is tracked in the `servers.status` column (`stopped|starting|running|stopping|error`) and updated by the use cases around each Docker call — it is the app's source of truth, not the live container state.

## Cross-cutting subsystems

- **Real-time console (WebSocket):** handled manually in `index.ts` via `server.on('upgrade')` (bypassing Express) at `/ws/servers/:id?token=JWT`. The JWT arrives as a **query param**, not a header, and is verified there. `modules/console/infrastructure/WsLogStream.ts` holds the per-server client set, demuxes the Docker log stream and broadcasts; `streamIfRunning(serverId)` resolves the container via the console read-model repo. HTTP console = the `getLogs` (`DockerLogReader`) and `sendCommand` (`RconConsoleGateway`) use cases. Note: the Vite dev proxy only forwards `/api`, not `/ws`.
- **RCON** (`rcon-client`) is wrapped behind the console domain port `ConsoleGateway` (`RconConsoleGateway`), used by `POST .../console/command` and by the watchdog. Connects to `127.0.0.1:{rcon_port}`.
- **Watchdog** (`watchdog/Watchdog.ts`): an injectable application service (constructed in `watchdog/watchdog.service.ts`, which stays the composition root and still exports `startWatchdog`/`resetCounter`). It takes the `server` module's `ServerRepository` + `ServerRuntime` and the `console` module's `ConsoleGateway`. A `setInterval` (60s) RCON-polls `list` on every `running` server and auto-stops one after 5 consecutive zero-player checks. The inactivity counters are an **in-memory `Map`** — they reset on process restart, and `resetCounter(id)` must be called whenever a server is stopped/deleted out of band (the `server` module does this via its `ServerActivityTracker` port → `WatchdogServerActivityTracker`). Note: `watchdog.service.ts` must NOT import the server `factory` (would create an import cycle through the activity tracker).
- **Backups** (`modules/backup`): `BackupArchiver` (`tar -czf` via `Bun.spawn`, staged in `/tmp`) + `BackupStorage` (S3/R2 via `@aws-sdk/client-s3`, `region: 'auto'`, `forcePathStyle: true`) + `BackupRepository` (Postgres). Restore wipes the data dir and extracts with `--strip-components=1`. Requires `tar` in the runtime image; the server should be stopped before restore.

## Frontend architecture

React 19 + react-router 7 + Tailwind v4 (via `@tailwindcss/vite` — no `tailwind.config`/PostCSS). Same DDD layering as the backend: `frontend/src/modules/<context>/` with `domain → application → infrastructure` + UI (`hooks`, `components` = pure presenters, `containers` = orchestrate). Contexts: `server`, `auth`, `backup`, `console`. Generic UI lives in `src/shared/components/` (Layout, Spinner, ConfirmDialog, NotFoundPage).

- **Infrastructure**: `HttpXRepository` classes implement the domain repository ports over `api/client.ts#apiFetch`, which attaches the bearer token from `localStorage` and, on any `401`, clears the token and hard-redirects to `/login`. The API contract is **camelCase**.
- **Hooks** wrap a module's `factory` use cases and expose loading/error state; **containers** consume hooks + manage local state; **presenters** are pure (data + callbacks via props).
- `AuthContext` (`modules/auth/context`) holds session state; routes render inside `ProtectedRoute` → `Layout` (see `main.tsx`).
- The console live stream opens a raw `WebSocket` to same-origin `/ws/...` — works in prod (nginx proxies `/ws`) but **not through `vite dev`** (proxy only forwards `/api`); the `GET /logs` seed still works in dev.
- **Gotcha:** the frontend `tsconfig` has `erasableSyntaxOnly: true` → constructor **parameter properties are not allowed** (the backend uses them freely). Declare fields explicitly and assign in the constructor body.

## Testing

The **use case** is the unit of test (per `~/.claude/docs/ddd-clean-architecture.md`). Repositories are mocked via a `RepositoryMother`; test data comes from an **Object Mother** (`@faker-js/faker`). No DB, no Docker, no infrastructure/integration tests. Tests are co-located per module in `src/modules/<context>/test/{helpers,application,domain,components}`.

- **Backend**: `bun:test`. Run `bun test` (or `cd backend && bun test`).
- **Frontend**: **Vitest + React Testing Library + jsdom** (a deliberate deviation from the agreement's Jest, since the stack is Vite). Config lives in `vite.config.ts` (`test` field) + `src/test/setup.ts`. Presenters are tested with RTL using accessible queries (never CSS classes); `Http*Repository` and the WebSocket are infrastructure and are not unit-tested. Run `cd frontend && bun run test`.

## Deploy / CI

`.github/workflows/deploy.yml` runs on push to `master`: first a **test** job (Bun, runs backend `bun test` + frontend `bun run test`), then — only if tests pass — builds and pushes `backend` and `frontend` images to GHCR (owner is lowercased — GHCR requires it; see the comment in `docker-compose.yml`), SSHes to the VPS, writes `/opt/mc-server-stack/.env` from GitHub Secrets, and runs `docker compose pull && up -d`. The compose `ortega` network is declared **external**, so it must already exist on the host (`docker network create ortega`). The frontend's nginx (`frontend/nginx.conf`) proxies `/api` and `/ws` to `backend:3000` in production.
