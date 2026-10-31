# `RoadmapTopic` MongoDB Collection

**Model:** `RoadmapTopicModel`  
**File Location:** [api/src/mongo/models/roadmap-topic.model.ts](../../api/src/mongo/models/roadmap-topic.model.ts)  
**Collection Name:** `roadmap_topics`

## Purpose

Stores the granular learning content, descriptions, and curated learning references attached to individual nodes within a roadmap canvas. When a user selects a node on `/resources/[slug]`, the frontend slide-over drawer fetches the corresponding `RoadmapTopic` document.

## Fields

- **`roadmapSlug`** (`String`, Required, Indexed): Slug of the parent roadmap this topic belongs to.
- **`nodeId`** (`String`, Required, Indexed): Unique node identifier mapped directly to the React Flow node `id`.
- **`topicSlug`** (`String`, Required): Semantic URL-friendly string representing the topic (e.g., `'html-basics'`).
- **`title`** (`String`, Required): Title of the topic displayed in header and navigation.
- **`description`** (`String`, Default: `""`): Quick summary of what this topic entails.
- **`content`** (`String`, Default: `""`): Comprehensive Markdown/HTML educational explanation, key takeaways, and guidance.
- **`resources`** (`Array` of `ResourceItem`): Curated learning links attached to this specific topic.
  - **`title`** (`String`, Required): Resource title (e.g., "MDN Web Docs: HTML").
  - **`url`** (`String`, Required): Direct link to documentation, video, or article.
  - **`type`** (`String`, Enum): Type of resource:
    - `'official'`
    - `'article'`
    - `'video'`
    - `'course'`
    - `'roadmap'`
    - `'book'`
    - `'podcast'`
    - `'opensource'`
    - `'other'`
- **`createdAt`** / **`updatedAt`** (`Date`): Standard Mongoose timestamps.

## Indexes

- `{ roadmapSlug: 1, nodeId: 1 }` (Unique) — Point lookup ensuring `O(1)` retrieval when clicking canvas nodes.
- `{ roadmapSlug: 1, topicSlug: 1 }` — Compound index for lookups by human-readable topic slug within a roadmap.
