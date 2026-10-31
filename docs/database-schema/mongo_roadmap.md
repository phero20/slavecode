# `Roadmap` MongoDB Collection

**Model:** `RoadmapModel`  
**File Location:** [api/src/mongo/models/roadmap.model.ts](../../api/src/mongo/models/roadmap.model.ts)  
**Collection Name:** `roadmaps`

## Purpose

Stores structured career and technical skill roadmaps (e.g., Frontend Developer, Backend Developer, DevOps, AI/ML). Each document defines the complete interactive graph (nodes, edges, dimensions, metadata) visualized on the frontend via React Flow at `/resources/[slug]`.

## Fields

- **`slug`** (`String`, Required, Unique, Indexed): The canonical URL-friendly identifier used in routes and topic lookups (e.g., `'frontend'`, `'backend'`).
- **`title`** (`Sub-document`, Required):
  - **`card`** (`String`): Short title shown on directory cards and navigation grids.
  - **`page`** (`String`): Full, descriptive title rendered on the roadmap canvas page.
- **`description`** (`String`): Detailed overview of what the roadmap covers.
- **`type`** (`String`, Enum: `'role' | 'skill'`, Default: `'skill'`, Indexed): Categorization distinguishing full career paths from focused technology or skill trees.
- **`categories`** (`Array` of `String`, Indexed): Taxonomy tags (e.g., `["engineering", "web-development"]`).
- **`nodesCount`** (`Number`, Default: `0`): Pre-computed count of topic nodes in the roadmap for quick display on cards.
- **`nodes`** (`Array` of `Mixed`): React Flow node objects specifying unique node IDs, coordinates `{ x, y }`, node types, and rendering configuration.
- **`edges`** (`Array` of `Mixed`): React Flow edge definitions connecting prerequisite, sequential, and parallel learning nodes.
- **`dimensions`** (`Sub-document`):
  - **`width`** (`Number`): Total width of the roadmap graph canvas.
  - **`height`** (`Number`): Total height of the roadmap graph canvas.
- **`relatedRoadmaps`** (`Array` of `String`): Array of related roadmap slugs recommended to learners upon roadmap completion.
- **`seo`** (`Mixed`): Custom OpenGraph metadata, title tags, and search descriptions for indexing.
- **`status`** (`String`, Default: `'published'`): Publication workflow flag (`'draft'`, `'published'`).
- **`createdAt`** / **`updatedAt`** (`Date`): Standard Mongoose timestamps.

## Indexes

- `{ slug: 1 }` (Unique) — Point lookups by roadmap slug.
- `{ type: 1 }` — Rapid filtering by role vs. skill roadmaps.
- `{ categories: 1 }` — Multikey index for category filtering in catalog views.
- `{ type: 1, "title.card": 1 }` — Compound index optimizing ordered directory lists.

