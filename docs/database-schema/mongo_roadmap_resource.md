# `RoadmapResource` MongoDB Collection

**Model:** `RoadmapResourceModel`  
**File Location:** [api/src/mongo/models/roadmap-resource.model.ts](../../api/src/mongo/models/roadmap-resource.model.ts)  
**Collection Name:** `roadmap_resources`

## Purpose

Stores curated official and community-submitted learning resources (e.g., YouTube video playlists, official documentation, deep-dive articles, and courses) mapped to developer career roadmaps. Powers the resources catalog, community resource submissions (`/resources/new`), upvoting mechanisms, and moderation queues.

## Fields

- **`title`** (`String`, Required, Trim): Descriptive name of the learning resource.
- **`description`** (`String`, Default: `""`): Brief overview of what the resource teaches.
- **`url`** (`String`, Required, Trim): Target destination link (e.g., YouTube playlist URL, MDN, documentation site).
- **`thumbnailUrl`** (`String`, Nullable): Thumbnail preview or cover image URL.
- **`type`** (`String`, Required, Default: `'Resource'`): Resource format (e.g., `'YouTube Playlist'`, `'Video'`, `'Documentation'`, `'Course'`, `'Article'`).
- **`author`** (`String`, Default: `""`): Creator, educator, or platform name (e.g., `'FreeCodeCamp'`, `'Traversy Media'`).
- **`roadmapIds`** (`Array` of `String`, Indexed): Associated roadmap slugs this resource supports (e.g., `["full-stack", "backend"]`).
- **`order`** (`Number`, Default: `0`): Manual ordering rank.
- **`origin`** (`String`, Enum: `'official' | 'community'`, Default: `'community'`, Indexed): Origin indicator distinguishing core platform selections from community contributions.
- **`status`** (`String`, Enum: `'pending' | 'approved' | 'rejected' | 'archived'`, Default: `'pending'`, Indexed): Moderation lifecycle state.
- **`submittedBy`** (`Sub-document`, Nullable): Submitter user details:
  - `userId` (`String`)
  - `username` (`String`)
  - `fullName` (`String`)
  - `avatarUrl` (`String`)
  - `submittedAt` (`Date`)
- **`review`** (`Sub-document`, Nullable): Moderation audit trail:
  - `reviewedBy` (`String`)
  - `reviewedAt` (`Date`)
  - `rejectionReason` (`String`)
  - `adminNotes` (`String`)
- **`stats`** (`Sub-document`):
  - **`upvotesCount`** (`Number`, Default: `0`): Aggregated upvote tally.
  - **`viewsCount`** (`Number`, Default: `0`): View engagement count.
- **`createdAt`** / **`updatedAt`** (`Date`): Standard Mongoose timestamps.

## Indexes

- `{ roadmapIds: 1, status: 1, order: 1 }` — Fast retrieval of approved learning resources filtered by roadmap.
- `{ status: 1, createdAt: -1 }` — Powers admin moderation feeds for reviewing newly submitted resources.
- `{ "submittedBy.userId": 1, status: 1 }` — Quickly locates resources submitted by a specific user.

