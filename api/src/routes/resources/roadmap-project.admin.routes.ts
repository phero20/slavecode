import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type RoadmapProjectAdminController } from "../../controllers/resources/roadmap-project.admin.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  listAdminProjectsQuerySchema,
  createAdminProjectSchema,
  updateAdminProjectSchema,
  moderateProjectSchema,
  projectSlugOrIdParamSchema,
} from "../../validators/resources/roadmap-project.admin.validator";

export interface RoadmapProjectAdminRouteDependencies {
  roadmapProjectAdminController: RoadmapProjectAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerRoadmapProjectAdminRoutes = (
  app: Hono<AppEnv>,
  deps: RoadmapProjectAdminRouteDependencies
) => {
  const {
    roadmapProjectAdminController,
    authMiddleware,
    authorizationMiddleware,
  } = deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  // ==========================================
  // STATS
  // ==========================================

  // GET /api/v1/admin/resources/projects/stats
  adminApp.get(
    "/stats",
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.getStats,
      { requireAuth: true }
    )
  );

  // ==========================================
  // CRUD & MODERATION
  // ==========================================

  // GET /api/v1/admin/resources/projects
  adminApp.get(
    "/",
    zValidator("query", listAdminProjectsQuerySchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.getAllProjects,
      { requireAuth: true }
    )
  );

  // GET /api/v1/admin/resources/projects/:slugOrId
  adminApp.get(
    "/:slugOrId",
    zValidator("param", projectSlugOrIdParamSchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.getProjectBySlugOrId,
      { requireAuth: true }
    )
  );

  // POST /api/v1/admin/resources/projects
  adminApp.post(
    "/",
    zValidator("json", createAdminProjectSchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.createProject,
      { requireAuth: true, status: 201 }
    )
  );

  // PUT /api/v1/admin/resources/projects/:slugOrId
  adminApp.put(
    "/:slugOrId",
    zValidator("param", projectSlugOrIdParamSchema),
    zValidator("json", updateAdminProjectSchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.updateProject,
      { requireAuth: true }
    )
  );

  // PATCH /api/v1/admin/resources/projects/:slugOrId/moderate
  adminApp.patch(
    "/:slugOrId/moderate",
    zValidator("param", projectSlugOrIdParamSchema),
    zValidator("json", moderateProjectSchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.moderateProject,
      { requireAuth: true }
    )
  );

  // DELETE /api/v1/admin/resources/projects/:slugOrId
  adminApp.delete(
    "/:slugOrId",
    zValidator("param", projectSlugOrIdParamSchema),
    roadmapProjectAdminController.action(
      roadmapProjectAdminController.deleteProject,
      { requireAuth: true }
    )
  );

  // Mount under /admin/resources/projects
  app.route("/admin/resources/projects", adminApp);
};

