# Proposed Project Structure

**Status: Proposed — no application source code created yet. Technology selections are recorded; the architecture and exact project structure still require explicit user approval.**

The repository currently contains product and architecture documentation. This is a proposal, not a report of existing folders.

## 1. Repository layout

```text
Link/
  apps/
    web/                         # React public pages and dashboard
      src/routes/
      src/features/
      src/components/
      src/lib/
      src/styles/
      public/
      tests/
    api/                         # Node.js HTTP API
      src/routes/
      src/middleware/
      src/modules/
      src/server/
      tests/
    worker/                      # Add only when background jobs are needed
  packages/
    contracts/                   # Public request/response/event schemas
      src/api/
      src/events/
      src/errors/
    sdk/                         # Future developer SDK
    config/                      # Shared config only where useful
  docs/adr/
  package.json                     # npm workspaces + root scripts
  package-lock.json               # committed lockfile
  tsconfig.base.json
  .gitignore
  README.md
```

Do not create empty packages to match the diagram. Start with apps/web, apps/api, packages/contracts, and minimum configuration. Add worker and SDK packages when approved use cases exist.

## 2. Frontend boundaries

The React frontend owns presentation and user interaction. It must not import backend repositories, database clients, secrets, or server-only modules.

- Public profile routes should support server rendering or prerendering for performance and discoverability.
- Dashboard routes may use client-side interactions where appropriate.
- API access goes through one typed client layer.
- Group features by domain: profile editor, links, themes, analytics, developer settings.
- Shared UI components must not contain persistence rules.
- Never place long-lived API secrets in browser code or browser storage.

**Selected:** React Router Framework Mode with TypeScript. Use SSR for dynamic public profiles and prerender routes only where the content can be safely generated at build time. Use Vercel's official React Router preset for Vercel-specific SSR behavior. Keep dashboard routes in the same app unless independent deployment becomes valuable.

## 3. API boundaries

The Node API is a transport layer around module-owned use cases. A route handler should authenticate, validate path/query/headers/body, enforce rate and payload limits, call a use case, map outcomes to a stable HTTP response, and emit structured telemetry without secrets. It must never serialize ORM entities directly.

Keep business rules out of route handlers. Use cases should be callable from HTTP routes, tests, and future background jobs without importing HTTP framework types.

## 4. Domain module template

```text
modules/
  profiles/
    domain/
      profile.ts
      profile-rules.ts
    application/
      create-profile.ts
      publish-profile.ts
      profile-repository.ts
    infrastructure/
      postgres-profile-repository.ts
    contracts/
      profile-input.ts
      public-profile.ts
    index.ts                    # Deliberate public exports only
```

This can live inside apps/api initially. Do not create a package for every small helper. Dependency boundaries matter more than exact folder names.

## 5. Shared contracts and SDK

packages/contracts is a stable boundary, not a miscellaneous shared folder. It may contain public API input/output schemas, error codes, pagination structures, versioned webhook payloads, and contract test fixtures. It must not contain ORM entities, secrets, UI components, or private implementation details.

The SDK is a later deliverable. Prefer generating it from OpenAPI or another authoritative API contract where practical; do not maintain a second incompatible API definition.

## 6. Vercel deployment model

Preferred initial shape:
- **Web project:** builds/deploys `apps/web` using React Router Framework Mode and the Vercel React Router preset for SSR.
- **API project:** deploys `apps/api` using Vercel's supported Fastify integration as request/response Functions.
- Both use the same repository and `packages/contracts`, with separate environment variables and deployment settings.
- Use npm workspace-aware install/build settings and verify that both projects can resolve shared workspace packages from the repository root.

Fastify on Vercel is not a promise of a permanently running Node server: function size, execution duration, concurrency, and database connection constraints apply. Test the production-shaped deployment before relying on runtime behavior.

Long-running consumers, continuous polling, and large asynchronous workloads should use a separately deployable worker runtime when needed. Vercel remains the initial web/API hosting choice, not a requirement that every future workload stay on Vercel.

## 7. Workspace and scripts

Use npm workspaces declared in the root `package.json` and commit `package-lock.json`. Root scripts should consistently support `npm ci`, lint, typecheck, unit/integration tests, independent web/API builds, and local development. CI must run the same checks used locally.

## 8. Import rules

- Web imports public contract schemas/types and a typed API client, never API infrastructure.
- API imports module public interfaces and shared contracts.
- Domain modules do not import web, HTTP, ORM, or provider SDKs.
- Contracts do not import applications, infrastructure, or database code.
- Workers import use cases/contracts and worker adapters, never UI code.
- No circular package dependencies.

Add lint or dependency-graph checks after the workspace exists.

## 9. Configuration and secrets

- Validate environment variables at application startup/build boundaries.
- Keep separate variables for web and API; expose only explicitly public frontend variables.
- Never expose secrets through public frontend environment prefixes.
- Do not commit secret-bearing environment files; provide a safe example file.
- Use separate least-privilege credentials per deployment.
- Never depend on local disk or process memory for durable shared state.

## 10. Structure approval checklist

- [x] React SSR/prerender framework selected: React Router Framework Mode (architecture approval still pending).
- [x] Node HTTP framework selected: Fastify (Vercel Function compatibility to be validated in a deployment spike).
- [x] Workspace manager selected: npm workspaces.
- [x] Database/ORM selected: managed PostgreSQL + Prisma ORM.
- [ ] Authentication/session design approved.
- [ ] Public API contract/versioning policy approved.
- [ ] Separate web/API deployment roots validated.
- [ ] User explicitly approves the structure before feature implementation.
