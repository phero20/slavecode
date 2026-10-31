# SEO Routes

The route definitions for SEO sitemap aggregation and search crawler indexing.

**File Location:** [api/src/routes/seo/seo.routes.ts](../../../api/src/routes/seo/seo.routes.ts)  
**Controller Location:** [api/src/controllers/seo/seo.controller.ts](../../../api/src/controllers/seo/seo.controller.ts)

## Architecture Overview

Instead of a monolithic sitemap endpoint that retrieves the entire platform database in a single query, the API provides **8 dedicated, lightweight sitemap endpoints**. These endpoints stream minimal identifier payloads (`slug`, `updatedAt`) to the Next.js frontend (`web/src/app/sitemap.ts`) to build incremental, edge-cacheable XML sitemaps.

All endpoints are public (`requireAuth: false`) and mounted under the `/api/v1/seo` path prefix.

---

## API Endpoints

### 1. Problem Set Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/problems`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapProblems`
- **Source**: MongoDB (`ProblemModel`)
- **Response Format**:
  ```json
  {
    "problems": [
      { "problem_id": "two-sum", "problem_slug": "two-sum", "updatedAt": "2026-10-25T12:00:00.000Z" }
    ]
  }
  ```

---

### 2. Academy Tracks Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/academy-tracks`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapAcademyTracks`
- **Source**: MongoDB (`AcademyTrackModel`)
- **Response Format**:
  ```json
  {
    "tracks": [
      { "slug": "frontend-developer" }
    ]
  }
  ```

---

### 3. Academy Exercises Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/academy-exercises`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapAcademyExercises`
- **Source**: MongoDB (`AcademyExerciseModel`)
- **Response Format**:
  ```json
  {
    "exercises": [
      { "trackSlug": "frontend-developer", "exerciseSlug": "html-semantics" }
    ]
  }
  ```

---

### 4. System Design Lessons Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/system-design-lessons`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapSystemDesignLessons`
- **Source**: MongoDB (`SystemDesignTopicModel`)
- **Response Format**:
  ```json
  {
    "lessons": [
      { "slug": "load-balancing" }
    ]
  }
  ```

---

### 5. Company Tags Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/company-tags`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapCompanyTags`
- **Source**: MongoDB (`CompanyModel`)
- **Response Format**:
  ```json
  {
    "companies": [
      { "slug": "google" }
    ]
  }
  ```

---

### 6. User Profiles Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/users`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapUsers`
- **Source**: PostgreSQL `users` table via Drizzle ORM
- **Response Format**:
  ```json
  {
    "users": [
      { "username": "alice", "updatedAt": "2026-10-30T09:15:00.000Z" }
    ]
  }
  ```

---

### 7. Developer Projects Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/projects`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapProjects`
- **Source**: MongoDB (`RoadmapProjectModel`, queries `{ status: "approved" }`)
- **Response Format**:
  ```json
  {
    "projects": [
      { "slug": "fullstack-kanban-board", "updatedAt": "2026-10-28T14:20:00.000Z" }
    ]
  }
  ```

---

### 8. Developer Roadmaps Sitemap
- **Method**: `GET`
- **Path**: `/api/v1/seo/sitemap/roadmaps`
- **Auth Required**: No
- **Controller Action**: `seoController.getSitemapRoadmaps`
- **Source**: MongoDB (`RoadmapModel`, queries published roadmaps)
- **Response Format**:
  ```json
  {
    "roadmaps": [
      { "slug": "frontend", "updatedAt": "2026-10-29T10:00:00.000Z" }
    ]
  }
  ```
