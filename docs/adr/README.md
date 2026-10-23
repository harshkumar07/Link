# Architecture Decision Records (ADRs)

ADRs record choices that are costly to reverse or affect multiple modules. A decision can remain proposed until the user approves it.

## When to write an ADR
- Selecting frameworks, runtimes, database, authentication, hosting, or queue provider.
- Defining module ownership or changing module boundaries.
- Adding cache, worker system, event bus, or separate service.
- Changing public API compatibility, identity, privacy, or analytics retention.
- Choosing migration, data partitioning, API key, webhook, or extension strategies.

## Template

Create a file named `NNNN-short-title.md`.

```markdown
# ADR NNNN: Title

- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD

## Context
What problem or constraint requires a decision?

## Decision
What are we choosing?

## Alternatives considered
What realistic options were evaluated?

## Consequences
Benefits, trade-offs, risks, and operational cost.

## Revisit when
What evidence would justify changing this decision?
```

## Initial decision records
1. [React + Node + Vercel monorepo](0001-react-node-vercel-monorepo.md) — proposed.
2. Database/ORM and migration strategy — pending.
3. Authentication and session strategy — pending.
4. Public API versioning and developer key lifecycle — pending.
5. Analytics ingestion, webhooks, and retention — pending.
6. Hosting, CDN, object storage, and custom domains — pending.