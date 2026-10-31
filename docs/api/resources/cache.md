# Resources Caching Strategy

The Resources domain implements a multi-tier caching layer using Redis to optimize response times for heavy canvas and catalog queries.

## Cache Services

### 1. `ResourceCache`
**File Location:** [api/src/cache/resources/resource.cache.ts](../../../api/src/cache/resources/resource.cache.ts)  
- **TTL**: 24 Hours (`86,400s`)
- **Key Patterns**:
  - `resource:roadmaps:${category}`
  - `resource:roadmaps:${category}:search:${query}`
  - `resource:roadmap:${slug}`
  - `resource:categories`
  - `resource:topic:${slug}:${nodeId}`
  - `resource:topic:${slug}:by-topic:${topicSlug}`

### 2. `RoadmapProjectCache`
**File Location:** [api/src/cache/resources/roadmap-project.cache.ts](../../../api/src/cache/resources/roadmap-project.cache.ts)  
- **TTLs**:
  - Lists: 30 Minutes (`1,800s`)
  - Details: 1 Hour (`3,600s`)
- **Key Patterns**:
  - `projects:catalog:*`
  - `projects:roadmap:*`
  - `projects:detail:${slug}`
  - `projects:categories`
  - `projects:popular:*`
- **Invalidation**: Non-blocking `redis.scanStream` batch deletion across all catalog and roadmap pattern keys when a project is created, updated, or deleted.

### 3. `RoadmapResourceCache`
**File Location:** [api/src/cache/resources/roadmap-resource.cache.ts](../../../api/src/cache/resources/roadmap-resource.cache.ts)  
- **TTLs**:
  - Lists: 30 Minutes (`1,800s`)
  - Details: 1 Hour (`3,600s`)
- **Key Patterns**:
  - `resources:roadmap:*`
  - `resources:detail:${id}`
  - `resources:popular:*`
- **Invalidation**: Non-blocking `redis.scanStream` batch deletion upon resource mutations or approval events.

