import { BaseController } from "../base.controller";
import type { IRoadmapProjectAdminService } from "../../types/resources/roadmap-project.admin.types";
import type { ICradle } from "../../libs/awilix-container";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import type {
  AdminProjectFilter,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
  ModerateProjectPayload,
} from "../../types/resources/roadmap-project.admin.types";

export class RoadmapProjectAdminController extends BaseController {
  private readonly roadmapProjectAdminService: IRoadmapProjectAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.roadmapProjectAdminService = cradle.roadmapProjectAdminService;
  }

  // ==========================================
  // 1. STATS
  // ==========================================

  async getStats(_req: ControllerRequest) {
    const data = await this.roadmapProjectAdminService.getStats();
    return ApiResponse.success(data);
  }

  // ==========================================
  // 2. PROJECT LIST & DETAIL
  // ==========================================

  async getAllProjects(
    req: ControllerRequest<never, never, AdminProjectFilter>
  ) {
    const data = await this.roadmapProjectAdminService.getAllProjects(
      req.query
    );
    return ApiResponse.success(data);
  }

  async getProjectBySlugOrId(
    req: ControllerRequest<never, { slugOrId: string }, never>
  ) {
    const slugOrId = req.params?.slugOrId;
    if (!slugOrId) {
      throw AppError.badRequest("Project identifier is required");
    }
    const data =
      await this.roadmapProjectAdminService.getProjectBySlugOrId(slugOrId);
    return ApiResponse.success(data);
  }

  // ==========================================
  // 3. CREATE & UPDATE
  // ==========================================

  async createProject(
    req: ControllerRequest<CreateAdminProjectPayload, never, never>
  ) {
    const adminUserId = req.user?.id || (req as any).auth?.userId;
    const data = await this.roadmapProjectAdminService.createProject(
      req.body,
      adminUserId
    );
    return ApiResponse.success(data);
  }

  async updateProject(
    req: ControllerRequest<
      UpdateAdminProjectPayload,
      { slugOrId: string },
      never
    >
  ) {
    const slugOrId = req.params?.slugOrId;
    if (!slugOrId) {
      throw AppError.badRequest("Project identifier is required");
    }
    const data = await this.roadmapProjectAdminService.updateProject(
      slugOrId,
      req.body
    );
    return ApiResponse.success(data);
  }

  // ==========================================
  // 4. MODERATE & DELETE
  // ==========================================

  async moderateProject(
    req: ControllerRequest<
      ModerateProjectPayload,
      { slugOrId: string },
      never
    >
  ) {
    const slugOrId = req.params?.slugOrId;
    if (!slugOrId) {
      throw AppError.badRequest("Project identifier is required");
    }
    const adminUserId =
      req.user?.id || (req as any).auth?.userId || "admin";
    const data = await this.roadmapProjectAdminService.moderateProject(
      slugOrId,
      req.body,
      adminUserId
    );
    return ApiResponse.success(data);
  }

  async deleteProject(
    req: ControllerRequest<never, { slugOrId: string }, never>
  ) {
    const slugOrId = req.params?.slugOrId;
    if (!slugOrId) {
      throw AppError.badRequest("Project identifier is required");
    }
    await this.roadmapProjectAdminService.deleteProject(slugOrId);
    return ApiResponse.success({
      success: true,
      message: "Project deleted successfully",
    });
  }
}

