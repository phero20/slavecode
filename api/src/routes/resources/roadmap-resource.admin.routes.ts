import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type RoadmapResourceAdminController } from "../../controllers/resources/roadmap-resource.admin.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  listAdminResourcesQuerySchema,
  createAdminResourceSchema,
  updateAdminResourceSchema,
  moderateResourceSchema,
  resourceIdParamSchema,
} from "../../validators/resources/roadmap-resource.admin.validator";

export interface RoadmapResourceAdminRouteDependencies {
  roadmapResourceAdminController: RoadmapResourceAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerRoadmapResourceAdminRoutes = (
  app: Hono<AppEnv>,
  deps: RoadmapResourceAdminRouteDependencies
) => {
  const {
    roadmapResourceAdminController,
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

  // GET /api/v1/admin/resources/items/stats
  adminApp.get(
    "/stats",
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.getStats,
      { requireAuth: true }
    )
  );

  // ==========================================
  // CRUD & MODERATION
  // ==========================================

  // GET /api/v1/admin/resources/items
  adminApp.get(
    "/",
    zValidator("query", listAdminResourcesQuerySchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.getAllResources,
      { requireAuth: true }
    )
  );

  // GET /api/v1/admin/resources/items/:id
  adminApp.get(
    "/:id",
    zValidator("param", resourceIdParamSchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.getResourceById,
      { requireAuth: true }
    )
  );

  // POST /api/v1/admin/resources/items
  adminApp.post(
    "/",
    zValidator("json", createAdminResourceSchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.createResource,
      { requireAuth: true, status: 201 }
    )
  );

  // PUT /api/v1/admin/resources/items/:id
  adminApp.put(
    "/:id",
    zValidator("param", resourceIdParamSchema),
    zValidator("json", updateAdminResourceSchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.updateResource,
      { requireAuth: true }
    )
  );

  // PATCH /api/v1/admin/resources/items/:id/moderate
  adminApp.patch(
    "/:id/moderate",
    zValidator("param", resourceIdParamSchema),
    zValidator("json", moderateResourceSchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.moderateResource,
      { requireAuth: true }
    )
  );

  // DELETE /api/v1/admin/resources/items/:id
  adminApp.delete(
    "/:id",
    zValidator("param", resourceIdParamSchema),
    roadmapResourceAdminController.action(
      roadmapResourceAdminController.deleteResource,
      { requireAuth: true }
    )
  );

  // Mount at both /admin/resources/items and /admin/resources/submissions
  app.route("/admin/resources/items", adminApp);
  app.route("/admin/resources/submissions", adminApp);
};

