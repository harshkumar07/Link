# Product Requirements

## 1. Vision

Help individuals and organizations create a polished, fast, trustworthy destination for their online identity. Link should become more than a list of buttons: it should be a modular home for a creator's audience, content, and workflows, with a stable developer platform that lets other products integrate safely.

## 2. Users

- **Creators:** share social profiles, content, projects, and products.
- **Professionals:** share portfolios, contact details, and booking links.
- **Small businesses:** present services, locations, menus, and lead forms.
- **Developers and integration builders:** build on a documented, versioned API and subscribe to events.
- **Teams and organizations (later):** manage shared profiles and permissions.

## 3. Product strategy

Priority is **developer-platform-first**, without skipping the creator experience that gives the platform useful data and users.

1. Establish secure, reliable profile and link primitives.
2. Define stable API conventions and contracts before external API consumers depend on internal implementation details.
3. Add developer authentication, scopes, quotas, and auditability.
4. Add signed webhooks and SDK/docs as the event and API surface stabilizes.
5. Expand into integrations and team capabilities based on demand.

The developer platform should extend the product, not force every internal module to become a public API.

## 4. Core user journeys

1. A user creates an account and chooses a unique username.
2. The user creates a profile, adds links, selects a theme, and previews the result.
3. The user publishes the profile at a stable public URL.
4. A visitor opens the profile quickly on mobile or desktop and follows a link.
5. The owner can update or unpublish the profile.
6. An authorized developer reads or modifies permitted resources through a documented API.
7. An integration receives a signed event webhook and can safely retry processing without duplicating its own side effects.

## 5. MVP requirements

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
- Public profile routes support server rendering or prerendering.
- Published pages have stable URLs and predictable status behavior.
- Public page data can be cached; unpublished/private data must not leak through shared caches.
- A missing, disabled, or unpublished profile returns the correct response.
- External links use safe URL schemes and appropriate rel attributes.

### API foundation
- Define API versioning, validation, error response format, pagination, request IDs, and rate-limit behavior before the API becomes public.
- Use explicit input/output contracts; never expose database models as public API responses.
- Authenticate and authorize every request server-side, including ownership and tenant boundaries.
- Maintain contract tests and a deprecation/compatibility policy.
- Keep internal application use cases separate from HTTP routes so they can be reused safely.

## 6. Developer platform capabilities

### API keys (planned after core identity/profile flows)
- Generate high-entropy secrets and show the secret only once.
- Store only a cryptographic hash of the secret.
- Support scopes, ownership, revocation, rotation, and audit history.
- Enforce quotas and rate limits server-side.
- Never expose keys in browser bundles or logs.

### Webhooks and events
- Publish documented, versioned event schemas.
- Sign webhook deliveries and include a delivery identifier and timestamp.
- Retry transient failures with bounded exponential backoff and jitter.
- Provide delivery logs and safe replay.
- Treat delivery as at-least-once; consumers must be able to handle duplicates.
- Protect webhook delivery against SSRF, redirects to private networks, and replay attacks.

### SDK and integrations
- Prefer a generated or contract-aligned SDK over separately maintained API definitions.
- Document authentication, errors, pagination, rate limits, retries, and examples.
- Begin with explicit integrations and outbound webhooks, not arbitrary executable plugins.
- Any future third-party code execution requires a sandbox, resource limits, permissions, and an isolated failure boundary.

## 7. Differentiators to validate

- Rich profile blocks beyond links.
- Conditional and scheduled links.
- Custom domains and domain verification.
- Contact/lead forms with spam protection.
- Campaign-aware analytics and export.
- Team workspaces, roles, and approval workflows.
- Optional digital products and booking integrations.

Prioritize features based on user demand, retention, performance, security, and operational cost.

## 8. Non-functional targets

Targets should be measured in production and revised using real traffic:
- Public pages should have a small critical rendering path and high cacheability.
- API latency and error rate should have defined service objectives before broad launch.
- A single application instance must not be required for correctness; requests should be stateless where possible.
- Background tasks must be retry-safe and idempotent.
- Database migrations must be backward-compatible with rolling deployments.
- The system should support horizontal application scaling without sticky sessions.
- External API and webhook contracts must be versioned and tested for compatibility.

## 9. Out of scope for initial release

- Microservices for every domain.
- A bespoke analytics warehouse before event volume justifies it.
- AI features without a validated use case.
- Payment processing before pricing and compliance requirements are clear.
- A public plugin marketplace or arbitrary third-party code execution before a secure extension model exists.
