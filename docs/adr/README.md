# Architecture Decision Records (ADRs)

Record decisions that are costly to reverse or affect multiple modules.

## When to write an ADR
- Selecting core frameworks, database, authentication, hosting, or queue provider.
- Defining module ownership or changing module boundaries.
- Adding a cache, worker system, event bus, or separate service.
- Changing public API compatibility, identity, privacy, or analytics retention.
- Choosing a migration or data partitioning strategy.

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

## Initial decisions to record
1. Framework and runtime.
2. PostgreSQL/ORM and migration strategy.
3. Authentication and session strategy.
4. Hosting, CDN, object storage, and domain strategy.
5. Analytics event ingestion and retention.
