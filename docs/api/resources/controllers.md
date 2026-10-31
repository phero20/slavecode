# Resources Controllers

**File Location:** [api/src/controllers/resources/resource.controller.ts](../../../api/src/controllers/resources/resource.controller.ts)

## Overview

The `ResourceController` extends `BaseController` and acts as the consolidated HTTP adapter across Roadmaps, Topics, Projects, and Learning Resources.

## Key Handlers

- **`getRoadmaps` / `getRoadmapBySlug`**: Extracts filters and queries from URL parameters and returns roadmap summaries or full React Flow graph models.
- **`getCategories`**: Returns the category taxonomy hierarchy (`RoadmapCategory`).
- **`getTopicByNodeId` / `getTopicsByRoadmap`**: Fetches topic content matching canvas nodes clicked in the frontend UI.
- **`getAllProjects` / `getProjectsByRoadmap` / `getProjectBySlug`**: Serves project catalogs, difficulty-based queries, and comprehensive specification models.
- **`createProject` / `updateProject` / `deleteProject`**: Handles author-authorized mutations and admin moderation actions on projects.
- **`createResource` / `updateResource` / `deleteResource`**: Handles user submissions and lifecycle state changes for community learning links.

