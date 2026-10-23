# Product Requirements

## 1. Vision

Help individuals and organizations create a polished, fast, trustworthy destination for their online identity. Link should be more than a list of buttons: it should become a modular home for a creator's audience, content, and workflows.

## 2. Users

- **Creators:** share social profiles, content, projects, and products.
- **Professionals:** share portfolios, contact details, and booking links.
- **Small businesses:** present services, locations, menus, and lead forms.
- **Teams and organizations (later):** manage shared profiles and permissions.
- **Developers (later):** extend profiles through a stable API and webhooks.

## 3. Core user journeys

1. A user creates an account and chooses a unique username.
2. The user creates a profile, adds links, selects a theme, and previews the result.
3. The user publishes the profile at a stable public URL.
4. A visitor opens the profile quickly on mobile or desktop and follows a link.
5. The owner sees aggregate views and clicks and can update or unpublish content.

## 4. MVP requirements

### Identity and ownership
- Every private resource is associated with an authenticated owner/account.
- Usernames are normalized and unique; reserved names and unsafe formats are rejected.
- Authentication identity is separate from the public profile slug.
- Account deletion and username changes have explicit policies.

### Profile and links
- A profile has display name, bio, avatar, theme, publication status, and metadata.
- Links have title, validated URL, ordering, enabled state, and optional presentation settings.
- Ordering is deterministic and updated atomically.
- Draft edits do not accidentally expose unpublished content.
- Public rendering never exposes private account fields.

### Public experience
- Mobile-first, accessible, fast, and SEO-aware.
- Published pages have stable URLs and predictable status behavior.
- Public page data can be cached; unpublished/private data must not leak through shared caches.
- A missing, disabled, or unpublished profile returns the correct response.
- External links use safe URL schemes and appropriate rel attributes.

### Analytics
- Record profile views and link clicks using a lightweight event path.
- Do not block navigation on analytics persistence.
- Avoid storing unnecessary personal data. Define retention, aggregation, and consent requirements before adding granular tracking.
- Analytics events must be deduplicated where practical and treated as approximate, not as financial records.

### Security and reliability
- Enforce ownership and permissions server-side on every mutation.
- Validate and normalize all inputs on the server.
- Rate-limit sign-in, profile mutations, and event ingestion.
- Protect against malicious URLs, XSS, CSRF where relevant, spam, scraping, and resource exhaustion.
- Use secrets from environment/secret management, never source control.
- Backups and restore procedures must be documented and tested.

## 5. Differentiators to validate

These are hypotheses, not MVP promises:
- Rich profile blocks beyond links.
- Conditional and scheduled links.
- Custom domains and domain verification.
- Contact/lead forms with spam protection.
- Campaign-aware analytics and export.
- Integrations, webhooks, and a versioned developer API.
- Team workspaces, roles, and approval workflows.
- Optional digital products and booking integrations.

Prioritize features based on user demand, retention, performance, security, and operational cost.

## 6. Non-functional targets

Targets should be measured in production and revised using real traffic:
- Public pages should have a small critical rendering path and high cacheability.
- API latency and error rate should have defined service objectives before broad launch.
- A single application instance must not be required for correctness; requests should be stateless where possible.
- Background tasks must be retry-safe and idempotent.
- Database migrations must be backward-compatible with rolling deployments.
- The system should support horizontal application scaling without sticky sessions.

## 7. Out of scope for MVP

- Microservices for every domain.
- A bespoke analytics warehouse before event volume justifies it.
- AI features without a validated use case.
- Payment processing before pricing and compliance requirements are clear.
- A plugin marketplace before a stable public extension contract exists.