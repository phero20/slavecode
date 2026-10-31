# `RoadmapProject` MongoDB Collection

**Model:** `RoadmapProjectModel`  
**File Location:** [api/src/mongo/models/roadmap-project.model.ts](../../api/src/mongo/models/roadmap-project.model.ts)  
**Collection Name:** `roadmap_projects`

## Purpose

Stores real-world, hands-on software development projects across varying difficulty tiers. Each document provides project specifications, feature requirements, interactive progress checklists, bonus challenges, and recommended tech stacks. Rendered in the `/projects` directory and detailed workspace at `/projects/[slug]`.

## Fields

- **`slug`** (`String`, Required, Unique, Indexed): URL-friendly project identifier.
- **`title`** (`String`, Required): Title of the project.
- **`description`** (`String`, Required): Concise overview of what the application does.
- **`difficulty`** (`String`, Enum: `'beginner' | 'intermediate' | 'advanced'`, Default: `'beginner'`, Indexed): Target experience level.
- **`roadmapIds`** (`Array` of `String`, Indexed): Associated roadmap slugs (e.g., `["frontend", "full-stack"]`).
- **`topics`** (`Array` of `String`): Technical topics and domains involved (e.g., `["state-management", "rest-api"]`).
- **`skills`** (`Array` of `String`): Practical skills gained by completing the project.
- **`order`** (`Number`, Default: `0`): Priority order within filtered listings.
- **`type`** (`String`, Default: `'code'`): Project format identifier.
- **`content`** (`Sub-document`):
  - **`overview`** (`String`): Broad architectural and problem context.
  - **`markdown`** (`String`): Detailed specifications and build guides.
  - **`previewImage`** (`String`, Nullable): Preview screenshot or mock image URL.
  - **`requirements`** (`Array` of `String`): Core functional and non-functional requirements.
  - **`checklist`** (`Array` of `String`): Interactive tasks users check off as they build.
  - **`bonusChallenges`** (`Array` of `String`): Extra credit / advanced extension ideas.
  - **`suggestedTechStack`** (`Array` of `String`): Recommended frameworks, libraries, and tools.
- **`origin`** (`String`, Enum: `'official' | 'community'`, Default: `'official'`, Indexed): Distinguishes core curated projects from community contributions.
- **`status`** (`String`, Enum: `'pending' | 'approved' | 'rejected' | 'archived' | 'updated'`, Default: `'approved'`, Indexed): Moderation lifecycle state.
- **`submittedBy`** (`Sub-document`, Nullable): Metadata for community submissions:
  - `userId` (`String`)
  - `username` (`String`)
  - `fullName` (`String`)
  - `avatarUrl` (`String`)
  - `submittedAt` (`Date`)
- **`review`** (`Sub-document`, Nullable): Admin review metadata:
  - `reviewedBy` (`String`)
  - `reviewedAt` (`Date`)
  - `rejectionReason` (`String`)
  - `adminNotes` (`String`)
- **`stats`** (`Sub-document`):
  - **`startedCount`** (`Number`, Default: `0`): Total learners who started the project.
  - **`completedCount`** (`Number`, Default: `0`): Total learners who finished and submitted repo links.
  - **`upvotesCount`** (`Number`, Default: `0`): Community upvote count.
- **`createdAt`** / **`updatedAt`** (`Date`): Standard Mongoose timestamps.

## Indexes

- `{ slug: 1 }` (Unique) — Direct point lookups by project slug.
- `{ roadmapIds: 1, status: 1, order: 1 }` — Efficient retrieval of approved projects associated with a given roadmap.
- `{ difficulty: 1, status: 1 }` — Rapid filtering by difficulty on the `/projects` directory page.
- `{ "submittedBy.userId": 1, status: 1 }` — Querying user-created project submissions in their profile or dashboard.

