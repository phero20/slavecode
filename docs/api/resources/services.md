# Resources Services

## Services Overview

### 1. `ResourceService`
**File Location:** [api/src/services/resources/resource.service.ts](../../../api/src/services/resources/resource.service.ts)  
Handles core roadmap business logic:
- Fetches and filters roadmaps by type (`role` or `skill`) and category.
- Provides text search across roadmap titles and descriptions.
- Coordinates topic lookups by canvas node ID or topic slug.

### 2. `RoadmapProjectService`
**File Location:** [api/src/services/resources/roadmap-project.service.ts](../../../api/src/services/resources/roadmap-project.service.ts)  
Handles project lifecycle and business rules:
- Validates difficulty levels (`beginner`, `intermediate`, `advanced`).
- Enforces reserved slug checks (prevents collisions with reserved frontend paths like `/projects/new`).
- Manages author ownership checks and admin bypasses for updating or deleting projects.
- Coordinates moderation transitions (`pending` ➔ `approved` / `rejected`).

### 3. `RoadmapResourceService`
**File Location:** [api/src/services/resources/roadmap-resource.service.ts](../../../api/src/services/resources/roadmap-resource.service.ts)  
Handles learning resources curation:
- Validates destination URLs and cleans up playlist parameters.
- Manages author permissions and review state updates.
- Sorts resources by upvote metrics and newest additions.

