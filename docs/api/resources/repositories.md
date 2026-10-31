# Resources Repositories

## Repositories Overview

### 1. `ResourceRepository`
**File Location:** [api/src/repositories/resources/resource.repository.ts](../../../api/src/repositories/resources/resource.repository.ts)  
Direct MongoDB operations against `roadmaps` and `roadmap_categories`:
- Queries published roadmaps with selective projection (`_id`, `slug`, `title`, `description`, `nodesCount`).
- Retrieves complete canvas configurations (`nodes`, `edges`, `dimensions`).

### 2. `RoadmapTopicRepository`
**File Location:** [api/src/repositories/resources/roadmap-topic.repository.ts](../../../api/src/repositories/resources/roadmap-topic.repository.ts)  
Direct MongoDB operations against `roadmap_topics`:
- Point lookups by compound unique index `{ roadmapSlug: 1, nodeId: 1 }`.
- Lookups by topic slug.

### 3. `RoadmapProjectRepository`
**File Location:** [api/src/repositories/resources/roadmap-project.repository.ts](../../../api/src/repositories/resources/roadmap-project.repository.ts)  
Direct MongoDB operations against `roadmap_projects`:
- Queries approved projects filtered by roadmap, difficulty, and order.
- Generates category summary aggregations across roadmaps.

### 4. `RoadmapResourceRepository`
**File Location:** [api/src/repositories/resources/roadmap-resource.repository.ts](../../../api/src/repositories/resources/roadmap-resource.repository.ts)  
Direct MongoDB operations against `roadmap_resources`:
- Queries approved resources sorted by `stats.upvotesCount` or `createdAt`.
- Moderation queue lookups for unreviewed resources (`status: "pending"`).

