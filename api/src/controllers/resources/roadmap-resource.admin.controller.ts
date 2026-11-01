import { BaseController } from "../base.controller";
import type { IRoadmapResourceAdminService } from "../../types/resources/roadmap-resource.admin.types";
import type { ICradle } from "../../libs/awilix-container";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import type {
  AdminResourceFilter,
  CreateAdminResourcePayload,
  UpdateAdminResourcePayload,
  ModerateResourcePayload,
} from "../../types/resources/roadmap-resource.admin.types";

export class RoadmapResourceAdminController extends BaseController {
  private readonly roadmapResourceAdminService: IRoadmapResourceAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.roadmapResourceAdminService = cradle.roadmapResourceAdminService;
  }

  // ==========================================
  // 1. STATS
  // ==========================================

  async getStats(_req: ControllerRequest) {
    const data = await this.roadmapResourceAdminService.getStats();
    return ApiResponse.success(data);
  }

  // ==========================================
  // 2. RESOURCE LIST & DETAIL
  // ==========================================

  async getAllResources(
    req: ControllerRequest<never, never, AdminResourceFilter>
  ) {
    const data = await this.roadmapResourceAdminService.getAllResources(
      req.query
    );
    return ApiResponse.success(data);
  }

  async getResourceById(
    req: ControllerRequest<never, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Resource ID is required");
    }
    const data = await this.roadmapResourceAdminService.getResourceById(id);
    return ApiResponse.success(data);
  }

  // ==========================================
  // 3. CREATE & UPDATE (AUTHOR PRESERVED)
  // ==========================================

  async createResource(
    req: ControllerRequest<CreateAdminResourcePayload, never, never>
  ) {
    const adminUserId = req.user?.id || (req as any).auth?.userId;
    const data = await this.roadmapResourceAdminService.createResource(
      req.body,
      adminUserId
    );
    return ApiResponse.success(data);
  }

  async updateResource(
    req: ControllerRequest<UpdateAdminResourcePayload, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Resource ID is required");
    }
    const data = await this.roadmapResourceAdminService.updateResource(
      id,
      req.body
    );
    return ApiResponse.success(data);
  }

  // ==========================================
  // 4. MODERATE & DELETE
  // ==========================================

  async moderateResource(
    req: ControllerRequest<ModerateResourcePayload, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Resource ID is required");
    }
    const adminUserId =
      req.user?.id || (req as any).auth?.userId || "admin";
    const data = await this.roadmapResourceAdminService.moderateResource(
      id,
      req.body,
      adminUserId
    );
    return ApiResponse.success(data);
  }

  async deleteResource(
    req: ControllerRequest<never, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Resource ID is required");
    }
    await this.roadmapResourceAdminService.deleteResource(id);
    return ApiResponse.success({
      success: true,
      message: "Resource deleted successfully",
    });
  }
}
