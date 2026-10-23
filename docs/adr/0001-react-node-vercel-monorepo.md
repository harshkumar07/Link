# ADR 0001: React + Node + Vercel Monorepo

- Status: Proposed — awaiting user approval
- Date: 2026-10-23

## Context

Link is intended to grow from a creator profile/link product into a developer platform with stable APIs, webhooks, SDKs, and integrations. The selected direction is React for the frontend, Node.js for the backend, Vercel for initial hosting, and a developer-platform-first priority.

Public profile pages need performance and search/social discoverability. Developer-facing APIs need stable contracts, tenant isolation, versioning, quotas, and safe extension boundaries.

## Decision

Propose a TypeScript monorepo with these initial boundaries:
- apps/web: React public pages and dashboard.
- apps/api: Node.js + TypeScript request/response API.
- packages/contracts: shared public request/response schemas and event contracts.
- docs: architecture, product requirements, data model, roadmap, and ADRs.

Use a modular monolith for business logic rather than starting with microservices. Deploy web and API independently on Vercel if the selected framework/runtime and repository configuration support it. Keep long-running workers independently deployable and add them only when needed.

React rendering choice is not finalized. React Router framework mode is the leading candidate because public profile routes need SSR/prerender support; a plain client-rendered Vite SPA is not the preferred default for public pages.

PostgreSQL is the proposed source of truth. Prisma and pnpm are candidates, not approved implementation decisions yet.

## Alternatives considered

### Single client-rendered React SPA
Simple deployment, but weaker default server-rendering/SEO characteristics for public profile pages. Could be used for a dashboard-only app.

### Next.js
Strong integrated React rendering and Vercel alignment, but the user selected React rather than specifically Next.js. Keep as an alternative if the chosen React framework creates unnecessary complexity.

### One long-running Node server
Simple local mental model, but deployment behavior differs from serverless request/response functions. Do not assume a persistent server model works unchanged on Vercel.

### Microservices from day one
Adds distributed failure modes, operations, and deployment complexity before demand is known. Rejected initially.

### Single app with no package boundaries
Fastest start, but risks mixing transport, business logic, public contracts, and persistence. Rejected in favor of a small monorepo with deliberate boundaries.

## Consequences

Benefits:
- Shared TypeScript across web, API, and contracts.
- Clear path to a developer API and SDK.
- Independent build/deployment configuration for web and API.
- Business logic can later move behind a separate service without rewriting frontend contracts.
- Modular boundaries support tests and incremental upgrades.

Trade-offs and risks:
- Monorepo tooling adds initial setup work.
- Vercel runtime and monorepo configuration must be validated for the chosen framework.
- Database connection pooling requires care under serverless concurrency.
- Long-running jobs may need a separate worker host.
- Shared contracts must remain a stable public boundary, not couple consumers to internal models.
- React framework choice remains open until SSR/prerender requirements and deployment compatibility are reviewed.

## Revisit when

- The selected React framework cannot meet public page performance/SEO needs without excessive custom code.
- API or worker workload exceeds Vercel's practical runtime constraints.
- Traffic metrics justify separate services, queues, read replicas, or dedicated analytics infrastructure.
- Developer API consumers require a formal compatibility/deprecation policy beyond the initial contract approach.
