# Delivery Roadmap

Roadmap is outcome-based. Do not start later phases until the preceding phase is tested and usable.

## Phase 0 — Foundation
- [ ] Confirm stack and hosting choices against the actual repository.
- [ ] Add architecture and product docs.
- [ ] Establish formatting, linting, type checking, unit/integration test commands.
- [ ] Add environment validation and safe configuration handling.
- [ ] Set up database migrations and a local development workflow.
- [ ] Add structured logging, error handling, and health checks.
- [ ] Add CI checks for lint, typecheck, tests, and production build.

**Exit:** a clean checkout can be configured, tested, and built repeatably.

## Phase 1 — Profile MVP
- [ ] Authentication and account lifecycle.
- [ ] Username reservation and uniqueness.
- [ ] Create/edit profile.
- [ ] Add/edit/remove/reorder links.
- [ ] Draft, publish, and unpublish states.
- [ ] Responsive public profile with theme system.
- [ ] Server-side ownership checks.
- [ ] End-to-end tests for the primary user journey.

**Exit:** a user can safely publish and maintain a working profile.

## Phase 2 — Production readiness
- [ ] Rate limiting and abuse controls.
- [ ] SEO metadata and social previews.
- [ ] Safe caching and cache invalidation.
- [ ] Backups and a tested restore procedure.
- [ ] Request/error/latency dashboards and alerts.
- [ ] Load test public reads and redirects.
- [ ] Privacy, retention, and account deletion policies.

**Exit:** known performance limits, recovery procedures, and operational signals exist.

## Phase 3 — Analytics and creator value
- [ ] Click and profile-view event capture.
- [ ] Async ingestion when required by load.
- [ ] Basic dashboard with date filters.
- [ ] UTM/campaign attribution.
- [ ] CSV export and retention controls.
- [ ] Scheduled links or richer profile blocks based on user feedback.

**Exit:** analytics are useful, bounded in cost, and do not slow public navigation.

## Phase 4 — Platform capabilities
Prioritize from validated demand:
- [ ] Custom domains with ownership verification.
- [ ] Lead/contact forms with spam controls.
- [ ] API keys and versioned developer API.
- [ ] Webhooks with signatures, retries, and delivery logs.
- [ ] Team workspaces and granular permissions.
- [ ] Billing and plan entitlements.
- [ ] Integration SDK or marketplace.

## Scale gates

Do not introduce infrastructure just because it appears in a diagram. Introduce it when metrics show a need:
- Cache: repeated hot reads or database load justify it.
- Queue/workers: asynchronous work impacts request latency or requires durable retries.
- Read replica: measured read pressure justifies replication and its consistency trade-offs.
- Analytics store/partitioning: event volume or reporting queries affect operational database performance.
- Separate services: clear independent scaling, ownership, or isolation need exists.