# Engineering foundation

This repository uses npm workspaces. Node.js 22.12+ and npm 10.9+ are expected.

## First-time setup

1. Run `npm install` from the repository root.
2. Copy `apps/api/.env.example` to `apps/api/.env` and provide a PostgreSQL connection string for local work.
3. Generate the Prisma client with `npm run prisma:generate`.
4. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
5. The generated root `package-lock.json` is committed. Use `npm ci` in CI and Vercel. Never commit real credentials.

## Workspace map

- `apps/web`: React Router Framework Mode with SSR enabled.
- `apps/api`: Fastify API; `src/server.ts` is the local HTTP entry point and `api/index.ts` is the Vercel Functions adapter.
- `packages/contracts`: shared Zod-based API contracts.
- `apps/api/prisma/schema.prisma`: PostgreSQL Prisma schema; no product/domain tables are defined yet.

## Local commands

- `npm run dev:web` — web development server.
- `npm run dev:api` — local API on port 3001 by default.
- `npm run prisma:validate` — validate the Prisma schema (requires `DATABASE_URL`).
- `npm run prisma:generate` — generate the Prisma client.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — verification commands.

## Vercel projects

Configure two distinct Vercel projects linked to this repository. These settings are proposals and still require successful Vercel build validation.

### Web project

- Root Directory: `apps/web`
- Install Command: `cd ../.. && npm ci` (requires the root lockfile).
- Build Command: `cd ../.. && npm run build --workspace @link/web`
- Let the React Router framework integration manage SSR output; do not configure a static output directory.

### API project

- Root Directory: `apps/api`
- Install Command: `cd ../.. && npm ci` (requires the root lockfile).
- Build Command: `cd ../.. && npm run build --workspace @link/api`
- Set `DATABASE_URL` in Vercel Environment Variables for each required environment.
- The API is request/response-oriented. Do not run a persistent listener inside a Vercel Function. Long-running jobs belong in a separately selected worker runtime if a real requirement arises.

The repository changes do not create or alter Vercel projects.

## Database safety

Use a managed PostgreSQL provider with connection pooling suitable for serverless workloads. Never run production migrations automatically during an application request or build. Review each migration and run it as a controlled deployment step. Do not add domain tables until the corresponding product design is approved.

## Current scope

This phase establishes configuration and a minimal health endpoint/test only. It does not implement profile management, authentication, link CRUD, themes, analytics, billing, SDKs, webhooks, or background workers.
