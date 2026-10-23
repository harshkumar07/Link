# Link

**Link is a developer-extensible creator identity and link-in-bio platform.**

The product starts with fast, customizable public profile pages and grows into a platform with a versioned API, webhooks, integrations, extension contracts, and team capabilities.

## Product and architecture documents

- [Product requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Proposed project structure](docs/PROJECT_STRUCTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture Decision Records](docs/adr/README.md)
- [Initial stack decision](docs/adr/0001-react-node-vercel-monorepo.md)

## Proposed stack

- **Language:** TypeScript across frontend, backend, and shared contracts.
- **Frontend:** React with a framework that supports server rendering/prerendering for public profile pages; React Router framework mode is the leading candidate. Final selection is pending approval.
- **Backend:** Node.js + TypeScript API, with framework-neutral application/domain modules.
- **Hosting:** Vercel for the web app and request/response API endpoints.
- **Database:** managed PostgreSQL as the durable source of truth.
- **Database access:** Prisma is a candidate; migrations and repository boundaries are mandatory regardless of ORM.
- **Contracts:** shared, versioned API schemas; later a generated or maintained TypeScript SDK.
- **Async processing:** add a durable queue and separate worker runtime when workload needs it. Do not assume Vercel request functions are suitable for long-running jobs.
- **Caching and media:** CDN/edge caching and object storage where justified by public traffic and media requirements.

Exact library/provider selections remain proposals until the architecture and project structure are agreed.

## Architectural principles

- Start with a **modular monolith** and clear module ownership.
- Keep domain rules independent of React, HTTP frameworks, ORM, and cloud providers.
- Build public APIs as explicit, versioned contracts; do not expose database models as API responses.
- Make extension points deliberate and permissioned. Do not execute arbitrary third-party code inside the core application.
- Keep request handlers stateless; correctness must not depend on one process's memory.
- Use PostgreSQL constraints and transactions for durable invariants.
- Cache published public content safely; never leak private dashboard data through shared caches.
- Use queues, retries, idempotency, and an outbox when asynchronous delivery becomes necessary.
- Add infrastructure and extract services only when measurements or ownership boundaries justify them.

## Delivery order

1. Agree on architecture and repository layout.
2. Establish workspace tooling, configuration validation, lint/typecheck/tests, and deployment checks.
3. Implement identity, profiles, links, and publishing.
4. Harden public read paths, access control, caching, and observability.
5. Add analytics and the versioned developer API.
6. Add signed webhooks, API keys, integration contracts, and eventually a carefully sandboxed extension ecosystem.

**Current status:** architecture/documentation phase. Product features and application source code have not been implemented.