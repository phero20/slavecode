import type { ICradle } from "../../libs/awilix-container";
import type {
  IResourceAdminRepository,
  IResourceAdminService,
  CreateRoadmapCategoryPayload,
  UpdateRoadmapCategoryPayload,
  CreateRoadmapPayload,
  UpdateRoadmapPayload,
  UpdateRoadmapStatusPayload,
  RoadmapAdminListFilter,
  ResourceAdminStats,
} from "../../types/resources/resource.admin.types";
import type { Roadmap } from "../../mongo/models/roadmap.model";
import type { RoadmapCategory } from "../../mongo/models/roadmap-category.model";
import type { ResourceCache } from "../../cache/resources/resource.cache";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("resource.admin.service");

export class ResourceAdminService implements IResourceAdminService {
  private readonly resourceAdminRepo: IResourceAdminRepository;
  private readonly resourceCache: ResourceCache;

  constructor({
    resourceAdminRepository,
    resourceCache,
  }: ICradle) {
    this.resourceAdminRepo = resourceAdminRepository;
    this.resourceCache = resourceCache;
  }

  // ==========================================
  // STATS
  // ==========================================

  async getStats(): Promise<ResourceAdminStats> {
    try {
      return await this.resourceAdminRepo.getStats();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to fetch resource admin stats");
      throw new AppError("Failed to fetch admin stats", { statusCode: 500 });
    }
  }

  // ==========================================
  // ROADMAP CATEGORY OPERATIONS
  // ==========================================

  async getAllCategories(): Promise<RoadmapCategory[]> {
    try {
      return await this.resourceAdminRepo.getAllCategories();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to fetch admin categories");
      throw new AppError("Failed to fetch roadmap categories", {
        statusCode: 500,
      });
    }
  }

  async getCategoryById(id: string): Promise<RoadmapCategory> {
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }

    const category = await this.resourceAdminRepo.getCategoryById(id);
    if (!category) {
      throw AppError.notFound(`Category with ID '${id}' not found`);
    }

    return category;
  }

  async createCategory(
    payload: CreateRoadmapCategoryPayload
  ): Promise<RoadmapCategory> {
    const cleanCategoryId = payload.categoryId.toLowerCase().trim();

    const existing = await this.resourceAdminRepo.getCategoryByCategoryId(
      cleanCategoryId
    );
    if (existing) {
      throw AppError.conflict(
        `Category with ID '${cleanCategoryId}' already exists`
      );
    }

    try {
      const category = await this.resourceAdminRepo.createCategory(payload);
      await this.resourceCache.invalidateCategoryCaches();
      return category;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, payload }, "Failed to create roadmap category");
      throw new AppError("Failed to create roadmap category", {
        statusCode: 500,
      });
    }
  }

  async updateCategory(
    id: string,
    payload: UpdateRoadmapCategoryPayload
  ): Promise<RoadmapCategory> {
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }

    const existing = await this.resourceAdminRepo.getCategoryById(id);
    if (!existing) {
      throw AppError.notFound(`Category with ID '${id}' not found`);
    }

    try {
      const updated = await this.resourceAdminRepo.updateCategory(id, payload);
      if (!updated) {
        throw AppError.notFound(`Category with ID '${id}' not found`);
      }

      await this.resourceCache.invalidateCategoryCaches();
      return updated;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id, payload }, "Failed to update category");
      throw new AppError("Failed to update category", { statusCode: 500 });
    }
  }

  async deleteCategory(id: string): Promise<void> {
    if (!id) {
      throw AppError.badRequest("Category ID is required");
    }

    const category = await this.resourceAdminRepo.getCategoryById(id);
    if (!category) {
      throw AppError.notFound(`Category with ID '${id}' not found`);
    }

    const assignedCount =
      await this.resourceAdminRepo.getRoadmapsCountByCategory(
        category.categoryId
      );

    if (assignedCount > 0) {
      throw AppError.badRequest(
        `Cannot delete category '${category.title}' because ${assignedCount} active roadmap(s) belong to it. Reassign or remove them first.`
      );
    }

    const deleted = await this.resourceAdminRepo.deleteCategory(id);
    if (!deleted) {
      throw AppError.notFound(`Category with ID '${id}' not found`);
    }

    await this.resourceCache.invalidateCategoryCaches();
  }

  // ==========================================
  // ROADMAP OPERATIONS
  // ==========================================

  async getAllRoadmaps(filter?: RoadmapAdminListFilter): Promise<Roadmap[]> {
    try {
      return await this.resourceAdminRepo.getAllRoadmaps(filter);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, filter }, "Failed to fetch admin roadmaps");
      throw new AppError("Failed to fetch roadmaps", { statusCode: 500 });
    }
  }

  async getRoadmapBySlug(slug: string): Promise<Roadmap> {
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    const roadmap = await this.resourceAdminRepo.getRoadmapBySlug(slug);
    if (!roadmap) {
      throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
    }

    return roadmap;
  }

  async createRoadmap(payload: CreateRoadmapPayload): Promise<Roadmap> {
    const cleanSlug = payload.slug.toLowerCase().trim();

    const existing = await this.resourceAdminRepo.getRoadmapBySlug(cleanSlug);
    if (existing) {
      throw AppError.conflict(
        `Roadmap with slug '${cleanSlug}' already exists`
      );
    }

    try {
      const roadmap = await this.resourceAdminRepo.createRoadmap(payload);

      await this.resourceAdminRepo.syncCategoryCounts();
      await this.resourceCache.invalidateRoadmapCaches(cleanSlug);

      return roadmap;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, payload }, "Failed to create roadmap");
      throw new AppError("Failed to create roadmap", { statusCode: 500 });
    }
  }

  async updateRoadmap(
    slug: string,
    payload: UpdateRoadmapPayload
  ): Promise<Roadmap> {
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    const existing = await this.resourceAdminRepo.getRoadmapBySlug(slug);
    if (!existing) {
      throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
    }

    try {
      const updated = await this.resourceAdminRepo.updateRoadmap(
        slug,
        payload
      );
      if (!updated) {
        throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
      }

      if (payload.categories) {
        await this.resourceAdminRepo.syncCategoryCounts();
      }

      await this.resourceCache.invalidateRoadmapCaches(slug);
      return updated;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug, payload }, "Failed to update roadmap");
      throw new AppError("Failed to update roadmap", { statusCode: 500 });
    }
  }

  async updateRoadmapStatus(
    slug: string,
    payload: UpdateRoadmapStatusPayload
  ): Promise<Roadmap> {
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    const existing = await this.resourceAdminRepo.getRoadmapBySlug(slug);
    if (!existing) {
      throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
    }

    try {
      const updated = await this.resourceAdminRepo.updateRoadmapStatus(
        slug,
        payload.status
      );
      if (!updated) {
        throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
      }

      await this.resourceAdminRepo.syncCategoryCounts();
      await this.resourceCache.invalidateRoadmapCaches(slug);
      return updated;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, slug, status: payload.status },
        "Failed to update roadmap status"
      );
      throw new AppError("Failed to update roadmap status", {
        statusCode: 500,
      });
    }
  }

  async deleteRoadmap(slug: string): Promise<void> {
    if (!slug) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    const existing = await this.resourceAdminRepo.getRoadmapBySlug(slug);
    if (!existing) {
      throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
    }

    try {
      const deleted = await this.resourceAdminRepo.deleteRoadmap(slug);
      if (!deleted) {
        throw AppError.notFound(`Roadmap with slug '${slug}' not found`);
      }

      await this.resourceAdminRepo.syncCategoryCounts();
      await this.resourceCache.invalidateRoadmapCaches(slug);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to delete roadmap");
      throw new AppError("Failed to delete roadmap", { statusCode: 500 });
    }
  }

  async syncCategoryCounts(): Promise<void> {
    try {
      await this.resourceAdminRepo.syncCategoryCounts();
      await this.resourceCache.invalidateCategoryCaches();
    } catch (error: any) {
      logger.error({ err: error }, "Failed to sync category counts");
      throw new AppError("Failed to sync category counts", {
        statusCode: 500,
      });
    }
  }
}
