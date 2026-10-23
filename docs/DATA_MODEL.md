# Initial Data Model

This is a logical model, not a final ORM schema. Confirm exact fields and deletion policies before implementing migrations.

## Core entities

### Account
- id: opaque primary key
- email / authentication-provider mapping
- status
- created_at, updated_at

### Profile
- id
- account_id: owner
- normalized_slug: globally unique, indexed
- display_name, bio, avatar_asset_id
- publication_status: draft / published / suspended
- theme_id or validated theme configuration
- content_version: increments when public content changes
- published_at, created_at, updated_at

### Link
- id
- profile_id
- title
- normalized_url
- position or stable ordering key
- enabled
- created_at, updated_at

### Asset (when media uploads are introduced)
- id
- owner_account_id
- storage_key (not a public secret)
- media_type, byte_size, dimensions
- processing_status
- created_at

### AnalyticsEvent (MVP only)
- id
- event_type
- profile_id
- link_id (nullable for profile view)
- occurred_at
- minimal attribution fields with explicit retention
- deduplication key where useful

## Relationships

- One account can own one or more profiles if product policy allows it.
- One profile has many links.
- A link must belong to the profile referenced by the event.
- Asset access must be authorized by ownership and publication policy.
- Public profile queries must return only public fields.

## Invariants

1. Normalized usernames are unique and reserved routes cannot be claimed.
2. A published profile must satisfy publication validation.
3. Link order is deterministic, with no duplicate ordering state within a profile where the chosen representation can prevent it.
4. Every mutation checks authenticated ownership or an explicit permission.
5. Unpublishing takes effect in the origin and eventually invalidates/version-busts public caches.
6. Deleting a profile defines what happens to links, analytics, assets, and redirects.
7. IDs are never treated as authorization. Knowing an ID must not grant access.
8. Slug normalization rules are shared by create, update, lookup, and routing.

## Indexing starting points

Candidate indexes, to be validated with real query plans:
- unique index on Profile.normalized_slug
- index on Profile.account_id
- composite index on Link(profile_id, position)
- index on AnalyticsEvent(profile_id, occurred_at)
- index on AnalyticsEvent(link_id, occurred_at)

Do not add every possible index: indexes increase write cost and storage. Analytics tables may need time partitioning or archival later, based on measured volume.

## Migration policy

- Migrations are reviewed and committed with code.
- Prefer additive changes first.
- Deploy compatible code before removing old fields.
- Backfill large datasets in bounded batches.
- Never rely on an automatic production schema push as a substitute for reviewed migrations.