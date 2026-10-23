# ADR 0001: React Router + Fastify + PostgreSQL/Prisma + npm Monorepo

- Status: Accepted — architecture and project structure approved by the user on 2026-10-23
- Date: 2026-10-23

## Context

Link is intended to grow from a creator profile/link product into a developer platform with stable APIs, webhooks, SDKs, and integrations. The selected direction is React for the frontend, Node.js for the backend, Vercel for initial hosting, and a developer-platform-first priority.

Public profile pages need performance and search/social discoverability. Developer-facing APIs need stable contracts, tenant isolation, versioning, quotas, and safe extension boundaries. The repository is currently documentation-only. The user has approved the architecture and project structure; this is not itself a request to begin feature implementation.

## Decision

Use a TypeScript monorepo with npm workspaces and these initial boundaries:

- `apps/web`: React Router Framework Mode for public profile pages and dashboard.
- `apps/api`: Node.js + TypeScript + Fastify HTTP API.
- `packages/contracts`: shared public request/response schemas and versioned event contracts.
- `docs`: architecture, product requirements, data model, roadmap, and ADRs.

Use a modular monolith for business logic rather than starting with microservices. Deploy `apps/web` and `apps/api` as separate Vercel projects from the same repository, with independent environment variables and deployment settings. Keep long-running workers independently deployable and add them only when needed.

Use React Router Framework Mode with SSR for dynamic public profile pages and selective prerendering for routes whose content can be safely generated at build time. Vercel documents a dedicated React Router integration and recommends its `@vercel/react-router` preset for Vercel SSR deployments.

Use Fastify for the Node API. Vercel documents Fastify deployment as a Function, so handlers must be designed for request/response execution and must not depend on a permanently running server process. Function limits still apply.

Use managed PostgreSQL as the source of truth and Prisma ORM for database access and migrations. Keep Prisma behind infrastructure/repository adapters. Use a pooled runtime database URL when supported by the provider and a direct URL for migrations when required. Do not assume a particular managed PostgreSQL vendor yet.

Use npm workspaces declared in the root `package.json`; commit `package-lock.json`. Do not introduce pnpm or another workspace manager.

## Compatibility review

### React Router Framework Mode + Vercel — compatible

Vercel documents SSR and static/pre-rendering support for React Router, including its official preset. This suits indexable public profiles and the authenticated dashboard. Dynamic profile pages should use SSR or a deliberate cache strategy; build-time prerendering is suitable only for known paths/content snapshots. Revalidate/invalidate public cache entries on publish, unpublish, edits, slug changes, and deletion.

### Fastify + Vercel — compatible with serverless trade-offs

Vercel supports Fastify as a Function. This gives automatic scaling and preview deployments, but all Function limits apply, including bundle-size and execution/runtime constraints. Avoid long-lived sockets, process-local durable state, continuous polling, and heavy jobs in request handlers. Keep routes and domain use cases portable so the API can move to a persistent Node host if a later workload needs it.

### PostgreSQL + Prisma — compatible with serverless when connection management is deliberate

Prisma supports PostgreSQL in serverless environments. Runtime connection pooling and client reuse must be configured for the selected provider/runtime. Keep migrations separate from ordinary request handling, use reviewed migrations, and test concurrent load against realistic connection limits. Prisma is a persistence adapter and must not leak ORM models into public API contracts.

### npm workspaces + monorepo — compatible

npm workspaces are native to npm and are sufficient for this small TypeScript monorepo. A single root lockfile simplifies reproducible installs. Vercel project root/build settings must be configured so both apps can resolve shared packages consistently. Trade-off: some scripts and deployment settings must be workspace-aware; no extra workspace tool is required initially.

## Alternatives considered

### Client-rendered React SPA only

Simpler runtime, but weaker initial HTML and SEO defaults for public profiles. Keep SPA behavior as an option for dashboard-like areas, not the public profile default.

### Next.js

Strong Vercel integration, but the selected direction is React with React Router Framework Mode. Revisit only if the chosen framework introduces material complexity or fails product requirements.

### Express or another Node HTTP framework

Fastify provides schema-oriented validation, plugin encapsulation, and a low-overhead TypeScript-friendly API. Express remains viable, but adopting it would be a separate decision rather than an implicit fallback.

### pnpm or another workspace manager

Could offer different workspace ergonomics, but npm workspaces satisfy current needs with no additional package-manager dependency. Use one package manager and one lockfile.

### Microservices from day one

Adds distributed failure modes, operations, and deployment complexity before demand is known. Rejected initially.

### Single app with no package boundaries

Fastest to start, but risks mixing transport, business logic, public contracts, and persistence. Rejected in favor of a small monorepo with deliberate boundaries.

## Consequences

Benefits:
- Shared TypeScript across web, API, and contracts.
- SSR/prerendering path for public profile pages.
- Fastify API with clear request/response and plugin boundaries.
- PostgreSQL relational constraints and Prisma migrations.
- Clear path to developer APIs, webhooks, SDKs, and integrations.
- Independent build/deployment configuration for web and API.
- Business logic can later move behind a separate service without rewriting frontend contracts.

Trade-offs and risks:
- Monorepo tooling and workspace-aware scripts add setup work.
- Separate web/API Vercel projects require routing, environment, CORS/cookie, and shared-package configuration decisions.
- Vercel Functions have size/runtime limits; long-running workers may need another host.
- Serverless database concurrency requires pooling and realistic load testing.
- Prisma can tempt domain code to couple to ORM models; enforce repository boundaries.
- SSR and caching must not leak private dashboard data or serve stale unpublished profiles.

## Revisit when

- Public profile traffic or cache invalidation requirements outgrow the current SSR/CDN model.
- API or worker workloads exceed Vercel's practical runtime constraints.
- Database performance or connection limits justify a different pooling/provider setup.
- Developer API consumers require a more formal compatibility/deprecation process.
- Measurements justify queues, read replicas, partitioning, or selective service extraction.
