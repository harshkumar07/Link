# Delivery Roadmap

The current phase is architecture agreement. Do not implement product features until the project layout and technology decisions are approved.

## Phase 0 — Architecture agreement
- [ ] Approve frontend rendering framework and SSR/prerender strategy.
- [ ] Approve Node API framework and Vercel deployment shape.
- [ ] Approve monorepo workspace tooling and package boundaries.
- [ ] Decide database provider/ORM and migration strategy.
- [ ] Decide authentication/session approach.
- [ ] Define public API versioning and contract policy.
- [ ] Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) and ADR 0001.

**Exit:** decisions are documented and the user approves the proposed structure.

## Phase 1 — Engineering foundation
- [ ] Set up TypeScript workspace and reproducible local development.
- [ ] Configure lint, format, typecheck, unit/integration tests, and production builds.
- [ ] Add environment schema validation and secret handling.
- [ ] Set up PostgreSQL migrations and repository boundaries.
- [ ] Add structured logging, request IDs, error mapping, and baseline metrics.
- [ ] Configure separate Vercel builds/deployments for web and API if supported by the agreed layout.
- [ ] Add CI checks; do not claim deployment is verified until a real build/deployment passes.

**Exit:** a clean checkout can be installed, tested, and built repeatably.

## Phase 2 — Creator core
- [ ] Authentication and account lifecycle.
- [ ] Unique normalized usernames and reserved routes.
- [ ] Profile draft/edit/publish/unpublish lifecycle.
- [ ] Create/edit/remove/reorder links.
- [ ] Responsive public profile rendering with themes.
- [ ] Server-side ownership and tenant-isolation tests.
- [ ] SEO metadata, social previews, and safe cache invalidation.

**Exit:** creators can publish and manage profiles securely.

## Phase 3 — Developer platform foundation
- [ ] API v1 conventions: errors, pagination, validation, request IDs, rate-limit headers.
- [ ] OpenAPI or equivalent contract documentation.
- [ ] API contract tests and compatibility checks.
- [ ] Developer authentication design and API key lifecycle.
- [ ] Scopes, quotas, revocation, audit records, and tenant isolation.
- [ ] SDK generation/maintenance policy.
- [ ] Developer documentation and examples.

**Exit:** external developers can integrate against a stable, documented API.

## Phase 4 — Events and integrations
- [ ] Click/profile-view analytics with privacy and retention policy.
- [ ] Versioned event schemas.
- [ ] Signed webhooks, delivery IDs, retry/backoff, and delivery logs.
- [ ] Idempotent workers and dead-letter handling.
- [ ] SSRF-safe webhook destination validation.
- [ ] Integration installation/removal lifecycle.

**Exit:** integrations are observable, secure, and safe to retry.

## Phase 5 — Growth and monetization
- [ ] Cache hot public profiles and measure hit ratio.
- [ ] Add durable queues and a separately deployed worker runtime where needed.
- [ ] Custom domains with ownership verification.
- [ ] Team workspaces and roles.
- [ ] Usage metering and billing only after product/pricing decisions.
- [ ] Optional richer blocks, lead capture, and scheduled links based on user demand.

## Scale gates

Add infrastructure based on evidence:
- Cache when repeated hot reads or database load justify it.
- Queue/workers when async work needs durable retries or is harming request latency.
- Read replicas when measured read pressure and consistency trade-offs justify them.
- Analytics storage/partitioning when event volume affects the operational database.
- Separate services when scaling, ownership, or isolation needs are demonstrated.

## Release checklist

- [ ] Unit, integration, API contract, and relevant E2E tests pass.
- [ ] Authentication, authorization, tenant isolation, and rate limits are tested.
- [ ] Migrations are backward-compatible with the deployment sequence.
- [ ] Logs and alerts cover important failure paths.
- [ ] Secrets are not committed or exposed to browser code.
- [ ] Rollback and data recovery approach is documented.