# Votes Module Overview

The **Votes Module** powers polymorphic upvoting and downvoting across all platform entities in SlaveCode.

## Architecture

Instead of implementing custom vote counters and tables per feature, the system uses a single unified table (`votes` in PostgreSQL via Drizzle ORM) and a centralized service.

Supported Target Types:
- `project` (Roadmap projects)
- `solution` (Community algorithm solutions)
- `roadmap` (Developer roadmaps)
- `resource` (Curated external learning links)

## Directory Structure

```text
api/src/
├── controllers/votes/
│   └── vote.controller.ts            # Vote HTTP handler
├── routes/votes/
│   └── vote.routes.ts                # REST routes mounted at /api/v1/votes
├── services/votes/
│   └── vote.service.ts               # Vote toggling, stat aggregations & Redis sync
├── repositories/votes/
│   └── vote.repository.ts            # Drizzle ORM queries against Postgres votes table
└── types/votes/
    └── vote.types.ts                 # TypeScript type definitions
```

