# Realtime Chat — Next.js + NestJS + WebSockets + MySQL

Monorepo:
- `backend/` — NestJS 10, Prisma, Socket.IO, JWT, Clean Architecture (POO).
- `frontend/` — Next.js 14 (App Router), Tailwind, Zustand, socket.io-client.
- `docker-compose.yml` — MySQL 8, Redis, Adminer.

📚 **[Ver Guía Completa de Deployment](./DEPLOYMENT-GUIDE.md)** - Instrucciones detalladas para desarrollo y producción.

## 🚀 Deployment

Esta aplicación está desplegada en:

- **Frontend**: [Vercel](https://vercel.com) - Hosting de Next.js con deploy automático desde GitHub
- **Backend API**: [Render](https://render.com) - Servicio web para NestJS con WebSocket support
- **Base de Datos**: [Aiven](https://aiven.io) - MySQL managed database (1GB free tier)

**Stack de Producción**: Vercel + Render + Aiven = 100% gratis para proyectos pequeños/medianos.

## Requisitos

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm` o `corepack enable && corepack prepare pnpm@latest --activate`)
- Docker + Docker Compose

## Stack

**Backend**: NestJS, Prisma, Passport JWT, bcrypt, class-validator, Throttler, Helmet, Swagger, Pino.
**Frontend**: Next.js, React 18, Tailwind, Zustand (estado), TanStack Query (opcional), socket.io-client, lucide-react.

## Arquitectura

<img width="3341" height="7147" alt="Chat App Architecture-2026-05-27-002709" src="https://github.com/user-attachments/assets/4e1affc6-eddc-4401-a2f7-5feaa5b2bf37" />

## Arquitectura DB

<img width="4448" height="3667" alt="Chat App DB relations-2026-05-27-002654" src="https://github.com/user-attachments/assets/eea63a3b-d27e-4032-85f4-bf50c42811b6" />

## Clean Architecture NestJS

<img width="8192" height="5167" alt="Chat Application Backend Clean Architecture-2026-05-27-002638" src="https://github.com/user-attachments/assets/a0b314a7-6926-498b-8282-ebcf4d642c6c" />

## Arquitectura backend (por feature)

```
src/modules/<feature>/
  domain/           entidades + interfaces de repos/servicios (sin dependencias externas)
  application/      use cases + DTOs
  infrastructure/   implementaciones (Prisma, Bcrypt, Socket.IO, Passport)
  presentation/     controllers HTTP
  <feature>.module.ts
```

Inyección por token (`USER_REPOSITORY`, `MESSAGE_REPOSITORY`, `PASSWORD_HASHER`) → DIP.

## Arranque

### 1. Servicios (MySQL + Redis + Adminer)

```bash
docker compose up -d
```

Adminer en `http://localhost:8080` (server: `mysql`, user: `chatapp_nestjs_nextjs`, pass: `chatapp_nestjs_nextjs`, db: `chat_db`).

### 2. Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm exec prisma migrate dev --name init
pnpm start:dev
```

API: `http://localhost:3001/api` · Swagger: `http://localhost:3001/api/docs`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm dev
```

App: `http://localhost:3000`.

## Flujo

1. Registrate en `/login` (modo register).
2. Hacé login → se guarda `accessToken` en Zustand persistido.
3. En `/chat`, creá una room con `+` y empezá a chatear.
4. Abrí otra pestaña con otra cuenta para ver mensajes en tiempo real + indicador "typing".

## Endpoints clave

- `POST /api/auth/register` — `{ email, username, password }`
- `POST /api/auth/login` — `{ identifier, password }` → `{ accessToken, refreshToken, user }`
- `GET /api/auth/me` — requiere `Authorization: Bearer <token>`
- `GET /api/chat/rooms`
- `POST /api/chat/rooms` — `{ name }`
- `GET /api/chat/rooms/:id/messages?limit=50`

## Eventos WebSocket (`/chat` namespace)

Auth: `socket = io('/chat', { auth: { token } })`

- `room:join` → `{ roomId }`
- `room:leave` → `{ roomId }`
- `message:send` → `{ roomId, content }` → emite `message:new` al room
- `typing` → `{ roomId, isTyping }`

## SOLID en el frontend (resumen)

- **S**: `useChatSocket` aísla la lógica de socket. `api.ts` aísla HTTP. Componentes solo renderizan.
- **O**: páginas reutilizan el hook; agregar features no requiere modificarlo.
- **L**: tipos compartidos (`Message`, `Room`) consistentes.
- **I**: interfaces TS por consumidor (`UseChatSocketOptions`), no DTOs gigantes globales.
- **D**: páginas dependen de `api`/`useChatSocket`, no de `fetch`/`socket.io` directos.

## Escalado a producción

- Redis adapter para Socket.IO (`@socket.io/redis-adapter`) → múltiples nodos.
- Refresh token rotation + cookies httpOnly.
- Rate limit por usuario en `message:send` (ya hay `@nestjs/throttler` global).
- Migraciones en CI: `prisma migrate deploy`.
- Logs estructurados con `nestjs-pino` (ya incluido en deps).
- Healthchecks (`@nestjs/terminus`) y métricas (Prometheus).
