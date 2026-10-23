# Link

**Link is a creator identity and link-in-bio platform with a developer-friendly API.**

## What is implemented

- Responsive creator dashboard with reusable UI components and a live mobile profile preview.
- Create, edit, enable/disable, search, and delete links; edit profile metadata and publish/unpublish the public page.
- Public profile route at `/:username`, sign-in and registration pages.
- Versioned Fastify endpoints under `/api/v1`, input validation, safe external link rendering, and a health endpoint.
- Basic HS256 JWT sessions delivered in an HttpOnly, SameSite cookie; password hashing uses Node.js scrypt and timing-safe comparison.
- npm workspaces for the web app, API and shared contracts; remote CI checks for typecheck, lint, tests, Prisma validation and build.

## Architecture

- **Web:** React Router Framework Mode, React, TypeScript, responsive CSS.
- **API:** Fastify + Zod, versioned routes, JWT and password utilities.
- **Persistence:** PostgreSQL + Prisma schema foundation is retained for the next persistence pass.
- **Shared UI:** `apps/web/app/components/ui.tsx` centralizes brand, buttons, cards, avatar, fields, modal, section heading and toast primitives.

## Run locally

Requires Node.js 22.12+ and npm 10.9+.

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run dev:api
# in another terminal
npm run dev:web
```

The web app runs on the React Router development port (normally http://localhost:5173); the API defaults to http://localhost:3001. Set `WEB_ORIGIN` to the web origin when running the API. For separately deployed apps, set `VITE_API_URL` in the web project's build environment to the API's HTTPS origin.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run prisma:validate
npm run build
```

## Important persistence note

The current identity/profile/link repository is an **in-memory starter implementation** so the full flow can be exercised without provisioned database credentials. Records are lost when the API process restarts or scales to a new serverless instance. Do not use this in-memory store as production persistence; the next required step is wiring the approved PostgreSQL + Prisma models and migrations before relying on accounts or published profiles. In production, set a unique `JWT_SECRET` of at least 32 characters and configure `WEB_ORIGIN` to the exact allowed web origin(s).

## UI design standards

Read [docs/UI_DESIGN_GUIDELINES.md](docs/UI_DESIGN_GUIDELINES.md) before building or changing UI. It defines the design-planning process, visual quality bar, accessibility and responsive requirements, and the correct iPhone 17 Pro live-preview proportions.
