import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type ResourceController } from "../../controllers/resources/resource.controller";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../validators/resource.validator";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export interface ResourceRouteDependencies {
  resourceController: ResourceController;
  authMiddleware: AuthMiddleware;
}

export const registerResourceRoutes = (
  app: Hono<AppEnv>,
  deps: ResourceRouteDependencies
) => {
  const { resourceController, authMiddleware } = deps;
  const resourceApp = new Hono<AppEnv>();

  // Attach soft-auth middleware so authenticated requests have req.user populated
  resourceApp.use("*", (c, next) => authMiddleware.handle(c, next));

  // GET /api/v1/resources/roadmaps (supports ?category=xxx & ?query=xxx)
  resourceApp.get(
    "/roadmaps",
    resourceController.action(resourceController.getRoadmaps, { requireAuth: false })
  );

  // GET /api/v1/resources/categories
  resourceApp.get(
    "/categories",
    resourceController.action(resourceController.getCategories, { requireAuth: false })
  );

  // GET /api/v1/resources/roadmaps/:slug
  resourceApp.get(
    "/roadmaps/:slug",
    resourceController.action(resourceController.getRoadmapBySlug, { requireAuth: false })
  );

  // GET /api/v1/resources/roadmaps/:slug/topics/:nodeId
  resourceApp.get(
    "/roadmaps/:slug/topics/:nodeId",
    resourceController.action(resourceController.getTopicByNodeId, { requireAuth: false })
  );

  // GET /api/v1/resources/roadmaps/:slug/topics
  resourceApp.get(
    "/roadmaps/:slug/topics",
    resourceController.action(resourceController.getTopicsByRoadmap, { requireAuth: false })
  );

  // GET /api/v1/resources/roadmaps/:slug/projects (supports ?difficulty=xxx)
  resourceApp.get(
    "/roadmaps/:slug/projects",
    resourceController.action(resourceController.getProjectsByRoadmap, { requireAuth: false })
  );

  // GET /api/v1/resources/projects (supports ?roadmap=xxx & ?difficulty=xxx & ?search=xxx & ?page=1 & ?limit=20)
  resourceApp.get(
    "/projects",
    resourceController.action(resourceController.getAllProjects, { requireAuth: false })
  );

  // GET /api/v1/resources/projects/popular (supports ?limit=10)
  resourceApp.get(
    "/projects/popular",
    resourceController.action(resourceController.getPopularProjects, { requireAuth: false })
  );

  // GET /api/v1/resources/projects/categories
  resourceApp.get(
    "/projects/categories",
    resourceController.action(resourceController.getProjectCategories, { requireAuth: false })
  );

  // GET /api/v1/resources/projects/user/:username
  resourceApp.get(
    "/projects/user/:username",
    resourceController.action(resourceController.getUserProjects, { requireAuth: false })
  );

  // GET /api/v1/resources/projects/:projectSlug
  resourceApp.get(
    "/projects/:projectSlug",
    resourceController.action(resourceController.getProjectBySlug, { requireAuth: false })
  );

  // POST /api/v1/resources/projects
  resourceApp.post(
    "/projects",
    zValidator("json", createProjectSchema),
    resourceController.action(resourceController.createProject, {
      requireAuth: true,
      status: 201,
    })
  );

  // PUT & PATCH /api/v1/resources/projects/:projectSlug
  resourceApp.put(
    "/projects/:projectSlug",
    zValidator("json", updateProjectSchema),
    resourceController.action(resourceController.updateProject, {
      requireAuth: true,
    })
  );

  resourceApp.patch(
    "/projects/:projectSlug",
    zValidator("json", updateProjectSchema),
    resourceController.action(resourceController.updateProject, {
      requireAuth: true,
    })
  );

  // DELETE /api/v1/resources/projects/:projectSlug
  resourceApp.delete(
    "/projects/:projectSlug",
    resourceController.action(resourceController.deleteProject, {
      requireAuth: true,
    })
  );

  app.route("/resources", resourceApp);
};
