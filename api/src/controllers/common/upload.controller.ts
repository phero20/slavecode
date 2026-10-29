import { BaseController } from "../base.controller";
import { type ICloudinaryService } from "../../services/common/cloudinary.service";
import { type ICradle } from "../../libs/awilix-container";
import type { Context } from "hono";

export class UploadController extends BaseController {
  private readonly cloudinaryService: ICloudinaryService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.cloudinaryService = cradle.cloudinaryService;
  }

  /**
   * Upload 1 to N images to Cloudinary.
   * Extracts raw HTTP payload and delegates validation, normalization,
   * and parallel upload execution to CloudinaryService.
   */
  uploadImages = async (c: Context) => {
    const contentType = c.req.header("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await c.req.json().catch(() => ({}))
      : await c.req.parseBody({ all: true });

    const files =
      payload["images"] ?? payload["files"] ?? payload["image"] ?? payload["file"];
    const folder = payload["folder"];

    const result = await this.cloudinaryService.uploadMedia({
      files,
      folder,
    });

    return this.created(c, result);
  };
}
