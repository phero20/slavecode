import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type ResourceAdminController } from "../../controllers/resources/resource.admin.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import {
  createRoadmapCategorySchema,
  updateRoadmapCategorySchema,
  createRoadmapSchema,
  updateRoadmapSchema,
  updateRoadmapStatusSchema,
} from "../../validators/resources/resource.admin.validator";

export interface ResourceAdminRouteDependencies {
  resourceAdminController: ResourceAdminController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerResourceAdminRoutes = (
  app: Hono<AppEnv>,
  deps: ResourceAdminRouteDependencies
) => {
  const { resourceAdminController, authMiddleware, authorizationMiddleware } =
    deps;
  const adminApp = new Hono<AppEnv>();

  // Ensure all routes require Auth and Admin role
  adminApp.use("*", authMiddleware.handle.bind(authMiddleware));
  adminApp.use("*", authorizationMiddleware.requireRoles("admin"));

  // ==========================================
  // STATS
  // ==========================================

  // GET /api/v1/admin/resources/stats
  adminApp.get(
    "/stats",
    resourceAdminController.action(resourceAdminController.getStats, {
      requireAuth: true,
    })
  );

  // ==========================================
  // ROADMAP CATEGORY ADMIN ROUTES
  // ==========================================

  // GET /api/v1/admin/resources/categories
  adminApp.get(
    "/categories",
    resourceAdminController.action(resourceAdminController.getAllCategories, {
      requireAuth: true,
    })
  );

  // POST /api/v1/admin/resources/categories
  adminApp.post(
    "/categories",
    zValidator("json", createRoadmapCategorySchema),
    resourceAdminController.action(resourceAdminController.createCategory, {
      requireAuth: true,
      status: 201,
    })
  );

  // GET /api/v1/admin/resources/categories/:id
  adminApp.get(
    "/categories/:id",
    resourceAdminController.action(resourceAdminController.getCategoryById, {
      requireAuth: true,
    })
  );

  // PUT & PATCH /api/v1/admin/resources/categories/:id
  adminApp.put(
    "/categories/:id",
    zValidator("json", updateRoadmapCategorySchema),
    resourceAdminController.action(resourceAdminController.updateCategory, {
      requireAuth: true,
    })
  );

  adminApp.patch(
    "/categories/:id",
    zValidator("json", updateRoadmapCategorySchema),
    resourceAdminController.action(resourceAdminController.updateCategory, {
      requireAuth: true,
    })
  );

  // DELETE /api/v1/admin/resources/categories/:id
  adminApp.delete(
    "/categories/:id",
    resourceAdminController.action(resourceAdminController.deleteCategory, {
      requireAuth: true,
    })
  );

  // ==========================================
  // DEVELOPER ROADMAP ADMIN ROUTES
  // ==========================================

  // GET /api/v1/admin/resources/roadmaps
  adminApp.get(
    "/roadmaps",
    resourceAdminController.action(resourceAdminController.getAllRoadmaps, {
      requireAuth: true,
    })
  );

  // POST /api/v1/admin/resources/roadmaps
  adminApp.post(
    "/roadmaps",
    zValidator("json", createRoadmapSchema),
    resourceAdminController.action(resourceAdminController.createRoadmap, {
      requireAuth: true,
      status: 201,
    })
  );

  // POST /api/v1/admin/resources/roadmaps/sync-categories
  adminApp.post(
    "/roadmaps/sync-categories",
    resourceAdminController.action(resourceAdminController.syncCategoryCounts, {
      requireAuth: true,
    })
  );

  // GET /api/v1/admin/resources/roadmaps/:slug
  adminApp.get(
    "/roadmaps/:slug",
    resourceAdminController.action(resourceAdminController.getRoadmapBySlug, {
      requireAuth: true,
    })
  );

  // PUT & PATCH /api/v1/admin/resources/roadmaps/:slug
  adminApp.put(
    "/roadmaps/:slug",
    zValidator("json", updateRoadmapSchema),
    resourceAdminController.action(resourceAdminController.updateRoadmap, {
      requireAuth: true,
    })
  );

  adminApp.patch(
    "/roadmaps/:slug",
    zValidator("json", updateRoadmapSchema),
    resourceAdminController.action(resourceAdminController.updateRoadmap, {
      requireAuth: true,
    })
  );

  // PATCH /api/v1/admin/resources/roadmaps/:slug/status
  adminApp.patch(
    "/roadmaps/:slug/status",
    zValidator("json", updateRoadmapStatusSchema),
    resourceAdminController.action(
      resourceAdminController.updateRoadmapStatus,
      {
        requireAuth: true,
      }
    )
  );

  // DELETE /api/v1/admin/resources/roadmaps/:slug
  adminApp.delete(
    "/roadmaps/:slug",
    resourceAdminController.action(resourceAdminController.deleteRoadmap, {
      requireAuth: true,
    })
  );

  app.route("/admin/resources", adminApp);
};
