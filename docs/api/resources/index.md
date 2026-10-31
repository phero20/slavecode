# Resources Module Overview

The **Resources Module** powers the Developer Career Roadmaps, React Flow Canvas Graphs, Real-World Portfolio Projects, and Community Learning Resources catalog in SlaveCode.

## Architecture

This module is split into three interrelated domains:

1. **Developer Roadmaps & Topics (`resource.*`)**:
   - Manages role-based and skill-based roadmaps (`roadmaps` collection).
   - Serves React Flow node/edge graph data and dimensions.
   - Serves granular topic drawers and Markdown summaries (`roadmap_topics` collection).
   - High-speed 24-hour Redis caching for static curriculum data.
2. **Developer Projects (`roadmap-project.*`)**:
   - Manages real-world portfolio projects across difficulty tiers (`beginner`, `intermediate`, `advanced`).
   - Detailed specification documents: requirements, interactive checklists, suggested tech stacks.
   - Community project submissions and moderation workflow (`pending` ➔ `approved` / `rejected`).
3. **Community Learning Resources (`roadmap-resource.*`)**:
   - Curated video playlists, documentation links, articles, and courses.
   - Community submissions with Zod URL validation and moderation.
   - Real-time upvoting integration.

## Directory Structure

```text
api/src/
├── controllers/resources/
│   └── resource.controller.ts            # Consolidated HTTP handlers for roadmaps, projects & resources
├── routes/resources/
│   └── resource.routes.ts                # REST Route declarations mounted at /api/v1/resources
├── services/resources/
│   ├── resource.service.ts               # Core roadmap & topic domain logic
│   ├── roadmap-project.service.ts        # Projects management & moderation logic
│   └── roadmap-resource.service.ts       # Learning resources & external playlist logic
├── repositories/resources/
│   ├── resource.repository.ts           # Roadmap MongoDB queries
│   ├── roadmap-topic.repository.ts      # Topic nodes MongoDB queries
│   ├── roadmap-project.repository.ts    # Project MongoDB queries & aggregations
│   └── roadmap-resource.repository.ts   # Learning resource MongoDB queries
└── cache/resources/
    ├── resource.cache.ts                 # Roadmaps & topics Redis caching
    ├── roadmap-project.cache.ts          # Projects Redis caching & SCAN invalidation
    └── roadmap-resource.cache.ts         # Resources Redis caching & SCAN invalidation
```

## Documentation Layers

- [Routes](./routes.md): Complete list of REST API endpoints.
- [Controllers](./controllers.md): Request extraction and HTTP response handling.
- [Services](./services.md): Business rules, deduplication, and authorization.
- [Repositories](./repositories.md): MongoDB queries, filtering, and pagination.
- [Cache](./cache.md): Multi-tier Redis TTLs and non-blocking `SCAN` invalidation.

