# Resources Routes

All routes are mounted under `/api/v1/resources` in [api/src/routes/resources/resource.routes.ts](../../../api/src/routes/resources/resource.routes.ts).

## 🗺️ Roadmap Endpoints

### 1. List Roadmaps
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps`
- **Query Params**: `category` (optional), `query` (optional search query)
- **Auth Required**: No
- **Controller Action**: `resourceController.getRoadmaps`

### 2. List Roadmap Categories
- **Method**: `GET`
- **Path**: `/api/v1/resources/categories`
- **Auth Required**: No
- **Controller Action**: `resourceController.getCategories`

### 3. Get Single Roadmap
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps/:slug`
- **Auth Required**: No
- **Controller Action**: `resourceController.getRoadmapBySlug`

### 4. Get Roadmap Topic by Canvas Node
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps/:slug/topics/:nodeId`
- **Auth Required**: No
- **Controller Action**: `resourceController.getTopicByNodeId`

### 5. Get All Topics in a Roadmap
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps/:slug/topics`
- **Auth Required**: No
- **Controller Action**: `resourceController.getTopicsByRoadmap`

---

## 🛠️ Project Endpoints

### 6. Get Projects for a Roadmap
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps/:slug/projects`
- **Query Params**: `difficulty` (`beginner` | `intermediate` | `advanced`)
- **Auth Required**: No
- **Controller Action**: `resourceController.getProjectsByRoadmap`

### 7. Explore All Projects
- **Method**: `GET`
- **Path**: `/api/v1/resources/projects`
- **Query Params**: `roadmap`, `difficulty`, `search`, `page`, `limit`
- **Auth Required**: No
- **Controller Action**: `resourceController.getAllProjects`

### 8. Get Popular Projects
- **Method**: `GET`
- **Path**: `/api/v1/resources/projects/popular`
- **Query Params**: `limit` (default: 10)
- **Auth Required**: No
- **Controller Action**: `resourceController.getPopularProjects`

### 9. Get Project Categories
- **Method**: `GET`
- **Path**: `/api/v1/resources/projects/categories`
- **Auth Required**: No
- **Controller Action**: `resourceController.getProjectCategories`

### 10. Get User Projects
- **Method**: `GET`
- **Path**: `/api/v1/resources/projects/user/:username`
- **Auth Required**: No
- **Controller Action**: `resourceController.getUserProjects`

### 11. Get Project by Slug
- **Method**: `GET`
- **Path**: `/api/v1/resources/projects/:projectSlug`
- **Auth Required**: No
- **Controller Action**: `resourceController.getProjectBySlug`

### 12. Create Project
- **Method**: `POST`
- **Path**: `/api/v1/resources/projects`
- **Auth Required**: Yes
- **Validation**: `createProjectSchema`
- **Controller Action**: `resourceController.createProject`

### 13. Update Project
- **Method**: `PUT` & `PATCH`
- **Path**: `/api/v1/resources/projects/:projectSlug`
- **Auth Required**: Yes
- **Validation**: `updateProjectSchema`
- **Controller Action**: `resourceController.updateProject`

### 14. Delete Project
- **Method**: `DELETE`
- **Path**: `/api/v1/resources/projects/:projectSlug`
- **Auth Required**: Yes
- **Controller Action**: `resourceController.deleteProject`

---

## 📚 Learning Resource Endpoints

### 15. Get Resources by Roadmap
- **Method**: `GET`
- **Path**: `/api/v1/resources/roadmaps/:slug/resources`
- **Query Params**: `type`, `sort` (`popular` | `newest`)
- **Auth Required**: No
- **Controller Action**: `resourceController.getResourcesByRoadmap`

### 16. Explore All Resources
- **Method**: `GET`
- **Path**: `/api/v1/resources/resources`
- **Query Params**: `roadmap`, `type`, `search`, `page`, `limit`
- **Auth Required**: No
- **Controller Action**: `resourceController.getAllResources`

### 17. Get Resource by ID
- **Method**: `GET`
- **Path**: `/api/v1/resources/resources/:resourceId`
- **Auth Required**: No
- **Controller Action**: `resourceController.getResourceById`

### 18. Create Community Resource
- **Method**: `POST`
- **Path**: `/api/v1/resources/resources`
- **Auth Required**: Yes
- **Validation**: `createResourceSchema`
- **Controller Action**: `resourceController.createResource`

### 19. Update Resource
- **Method**: `PUT` & `PATCH`
- **Path**: `/api/v1/resources/resources/:resourceId`
- **Auth Required**: Yes
- **Validation**: `updateResourceSchema`
- **Controller Action**: `resourceController.updateResource`

### 20. Delete Resource
- **Method**: `DELETE`
- **Path**: `/api/v1/resources/resources/:resourceId`
- **Auth Required**: Yes
- **Controller Action**: `resourceController.deleteResource`

