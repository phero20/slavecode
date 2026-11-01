import { BaseController } from "../base.controller";
import type { IResourceAdminService } from "../../types/resources/resource.admin.types";
import type { ICradle } from "../../libs/awilix-container";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import type {
  CreateRoadmapCategoryPayload,
  UpdateRoadmapCategoryPayload,
  CreateRoadmapPayload,
  UpdateRoadmapPayload,
  UpdateRoadmapStatusPayload,
  RoadmapAdminListFilter,
} from "../../types/resources/resource.admin.types";

export class ResourceAdminController extends BaseController {
  private readonly resourceAdminService: IResourceAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.resourceAdminService = cradle.resourceAdminService;
  }

  // ==========================================
  // STATS
  // ==========================================

  async getStats(_req: ControllerRequest) {
    const data = await this.resourceAdminService.getStats();
    return ApiResponse.success(data);
  }

  // ==========================================
  // ROADMAP CATEGORIES
  // ==========================================

  async getAllCategories(_req: ControllerRequest) {
    const data = await this.resourceAdminService.getAllCategories();
    return ApiResponse.success(data);
  }

  async getCategoryById(
    req: ControllerRequest<never, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }
    const data = await this.resourceAdminService.getCategoryById(id);
    return ApiResponse.success(data);
  }

  async createCategory(
    req: ControllerRequest<CreateRoadmapCategoryPayload, never, never>
  ) {
    const data = await this.resourceAdminService.createCategory(req.body);
    return ApiResponse.success(data);
  }

  async updateCategory(
    req: ControllerRequest<UpdateRoadmapCategoryPayload, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }
    const data = await this.resourceAdminService.updateCategory(id, req.body);
    return ApiResponse.success(data);
  }

  async deleteCategory(
    req: ControllerRequest<never, { id: string }, never>
  ) {
    const id = req.params?.id;
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }
    await this.resourceAdminService.deleteCategory(id);
    return ApiResponse.success({
      success: true,
      message: "Category deleted successfully",
    });
  }

  // ==========================================
  // DEVELOPER ROADMAPS
  // ==========================================

  async getAllRoadmaps(
    req: ControllerRequest<never, never, RoadmapAdminListFilter>
  ) {
    const data = await this.resourceAdminService.getAllRoadmaps(req.query);
    return ApiResponse.success(data);
  }

  async getRoadmapBySlug(
    req: ControllerRequest<never, { slug: string }, never>
  ) {
    const slug = req.params?.slug;
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }
    const data = await this.resourceAdminService.getRoadmapBySlug(slug);
    return ApiResponse.success(data);
  }

  async createRoadmap(
    req: ControllerRequest<CreateRoadmapPayload, never, never>
  ) {
    const data = await this.resourceAdminService.createRoadmap(req.body);
    return ApiResponse.success(data);
  }

  async updateRoadmap(
    req: ControllerRequest<UpdateRoadmapPayload, { slug: string }, never>
  ) {
    const slug = req.params?.slug;
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }
    const data = await this.resourceAdminService.updateRoadmap(slug, req.body);
    return ApiResponse.success(data);
  }

  async updateRoadmapStatus(
    req: ControllerRequest<UpdateRoadmapStatusPayload, { slug: string }, never>
  ) {
    const slug = req.params?.slug;
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }
    const data = await this.resourceAdminService.updateRoadmapStatus(
      slug,
      req.body
    );
    return ApiResponse.success(data);
  }

  async deleteRoadmap(
    req: ControllerRequest<never, { slug: string }, never>
  ) {
    const slug = req.params?.slug;
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }
    await this.resourceAdminService.deleteRoadmap(slug);
    return ApiResponse.success({
      success: true,
      message: "Roadmap deleted successfully",
    });
  }

  async syncCategoryCounts(_req: ControllerRequest) {
    await this.resourceAdminService.syncCategoryCounts();
    return ApiResponse.success({
      success: true,
      message: "Category counts synced successfully",
    });
  }
}
