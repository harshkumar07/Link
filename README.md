# Link

**Link is a creator identity and link-in-bio platform designed to grow into a modular creator operating system.**

It starts with fast, customizable public profile pages and expands through independently evolvable capabilities such as analytics, custom domains, lead capture, integrations, and creator tools.

## Product principles

- **Fast by default:** public pages should be lightweight, cacheable, mobile-first, and accessible.
- **Creator-owned identity:** predictable profile URLs, portable content, and transparent privacy controls.
- **Modular capabilities:** new features must be addable without rewriting core profile publishing.
- **Secure by design:** authorization on the server, tenant-aware data access, rate limits, abuse controls, and auditable sensitive actions.
- **Measure before scaling:** instrument performance and cost; add infrastructure only when measured demand requires it.
- **No premature microservices:** begin as a modular monolith with clear module boundaries and separately scalable workers.

## Documentation

- [Product requirements](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture decision records](docs/adr/README.md)

## Proposed initial stack

These are proposed defaults and should be validated against repository constraints before implementation:

- TypeScript
- Next.js for the web application and public profile rendering
- PostgreSQL as the source of truth
- Prisma for schema and migrations, behind module-owned repositories
- Redis-compatible cache/queue infrastructure when required
- Object storage for user-uploaded media
- CDN and edge caching for public assets and cacheable profile responses
- Automated tests, structured logs, metrics, tracing, and error reporting

The architecture is deliberately provider-neutral where practical. Product/domain code must not depend directly on a specific cloud provider.

## Initial release scope

1. Sign up/sign in and account settings.
2. Create and edit a profile with a stable username.
3. Add, reorder, enable/disable, and remove links.
4. Publish a responsive public profile page.
5. Theme and profile customization.
6. Basic privacy settings, validation, abuse protection, and click analytics.
7. Automated tests and documented deployment/configuration.

Advanced commerce, teams, custom domains, AI features, and a public integration marketplace are later capabilities, not prerequisites for launch.

## Engineering rule

Do not implement a new feature until its ownership, data model, authorization rules, failure behavior, observability, and tests are clear. See the architecture and ADR documents.