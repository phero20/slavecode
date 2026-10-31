# `votes` PostgreSQL Table

**ORM:** Drizzle ORM  
**File Location:** [api/src/db/schema.ts](../../api/src/db/schema.ts)  
**Table Name:** `votes`

## Purpose

Provides a generic, high-performance polymorphic voting table in PostgreSQL. Instead of duplicating vote tables across multiple entities, `votes` supports upvotes and downvotes across all platform target types (projects, roadmaps, community resources, solutions).

## Fields

- **`user_id`** (`uuid`, Required, PK, FK ➔ `users.id` with `onDelete: 'cascade'`): The user who cast the vote.
- **`target_type`** (`text`, Required, PK): The polymorphic discriminator type:
  - `'project'` (Developer portfolio projects)
  - `'solution'` (Community code solutions)
  - `'roadmap'` (Developer career roadmaps)
  - `'resource'` (External documentation, articles, courses, video playlists)
- **`target_id`** (`text`, Required, PK): Identifier of the target entity (Postgres UUID, MongoDB ObjectId string, or unique slug).
- **`vote_type`** (`integer`, Required): Numeric direction of the vote:
  - `1`: Upvote / Like
  - `-1`: Downvote
- **`created_at`** (`timestamp with time zone`, Default: `now()`): Creation timestamp.
- **`updated_at`** (`timestamp with time zone`, Default: `now()`): Last modified timestamp.

## Primary Key & Constraints

- **Composite Primary Key**: `(user_id, target_type, target_id)`  
  Guarantees that a single user can only have at most one active vote state per specific entity at any given time.

## Indexes

- **`votes_target_idx`**: Index on `(target_type, target_id)`. Essential for rapid point-aggregations of upvotes and downvotes when displaying entity score totals.
- **`votes_user_id_idx`**: Index on `user_id`. Powers user profile activity feeds and enables batch lookups of all entities upvoted by the authenticated user.

