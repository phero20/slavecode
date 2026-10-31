# `RoadmapCategory` MongoDB Collection

**Model:** `RoadmapCategoryModel`  
**File Location:** [api/src/mongo/models/roadmap-category.model.ts](../../api/src/mongo/models/roadmap-category.model.ts)  
**Collection Name:** `roadmap_categories`

## Purpose

Stores organized directory categories and hierarchical roadmap sections. Used on the `/resources` directory to display categorized groupings of developer roadmaps (e.g., Web Development, Cloud & DevOps, AI & Data Science) with their nested roadmap references.

## Fields

- **`categoryId`** (`String`, Required, Unique, Indexed): Unique semantic identifier for the category (e.g., `'web-development'`, `'devops'`, `'ai-data-science'`).
- **`title`** (`String`, Required): Display title rendered in the UI navigation header.
- **`count`** (`Number`, Default: `0`): Total number of roadmaps contained within this category.
- **`order`** (`Number`, Default: `0`, Indexed): Sort sequence rank for ordering category tabs and cards.
- **`sections`** (`Array` of `RoadmapCategorySection`): Grouped subsections within the category:
  - **`heading`** (`String`, Required): Section subheader (e.g., "Role-based Roadmaps", "Specialized Frameworks").
  - **`roadmaps`** (`Array` of `RoadmapItemRef`): Lightweight pointer references to roadmap documents:
    - **`slug`** (`String`, Required): Unique slug of the roadmap document.
    - **`title`** (`String`, Required): Display title of the referenced roadmap.
- **`createdAt`** / **`updatedAt`** (`Date`): Standard Mongoose timestamps.

## Indexes

- `{ categoryId: 1 }` (Unique) — Instant lookups by category ID.
- `{ order: 1 }` — Fast sorted queries to render categories in designated layout order.

