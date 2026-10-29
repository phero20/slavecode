import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type UploadController } from "../../controllers/common/upload.controller";

import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export interface UploadRouteDependencies {
  uploadController: UploadController;
  authMiddleware?: AuthMiddleware;
}

export const registerUploadRoutes = (
  app: Hono<AppEnv>,
  deps: UploadRouteDependencies,
) => {
  const { uploadController, authMiddleware } = deps;
  const uploadRouter = new Hono<AppEnv>();

  if (authMiddleware) {
    uploadRouter.use("*", (c, next) => authMiddleware.handle(c, next));
  }

  // POST /api/v1/upload (supports 1 to N images via multipart/form-data or json)
  uploadRouter.post("/", uploadController.uploadImages);

  app.route("/upload", uploadRouter);
};
