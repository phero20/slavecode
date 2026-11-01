import type { ICradle } from "../../libs/awilix-container";
import type {
  IRoadmapResourceAdminRepository,
  IRoadmapResourceAdminService,
  AdminResourceFilter,
  PaginatedAdminResourcesResult,
  AdminResourceStats,
  CreateAdminResourcePayload,
  UpdateAdminResourcePayload,
  ModerateResourcePayload,
} from "../../types/resources/roadmap-resource.admin.types";
import type { RoadmapResource } from "../../mongo/models/roadmap-resource.model";
import type { IUserRepository } from "../../repositories/user/user.repository";
import type { RoadmapResourceCache } from "../../cache/resources/roadmap-resource.cache";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("roadmap-resource.admin.service");

export class RoadmapResourceAdminService
  implements IRoadmapResourceAdminService
{
  private readonly roadmapResourceAdminRepo: IRoadmapResourceAdminRepository;
  private readonly userRepository: IUserRepository;
  private readonly roadmapResourceCache: RoadmapResourceCache;

  constructor({
    roadmapResourceAdminRepository,
    userRepository,
    roadmapResourceCache,
  }: ICradle) {
    this.roadmapResourceAdminRepo = roadmapResourceAdminRepository;
    this.userRepository = userRepository;
    this.roadmapResourceCache = roadmapResourceCache;
  }

  /**
   * Fetch all resources for admin moderation dashboard with full search and filters
   */
  async getAllResources(
    filter?: AdminResourceFilter
  ): Promise<PaginatedAdminResourcesResult> {
    try {
      const result = await this.roadmapResourceAdminRepo.getAllResources(filter);
      const hydratedResources = await this.hydrateAuthors(result.resources);

      return {
        ...result,
        resources: hydratedResources,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, filter }, "Failed to fetch admin resources");
      throw new AppError("Failed to fetch administrative resources", {
        statusCode: 500,
      });
    }
  }

  /**
   * Fetch single resource details by ID
   */
  async getResourceById(id: string): Promise<RoadmapResource> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource ID is required");
    }

    try {
      const resource = await this.roadmapResourceAdminRepo.getResourceById(id);
      if (!resource) {
        throw AppError.notFound(`Resource with ID '${id}' not found`);
      }

      return await this.hydrateAuthor(resource);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id }, "Failed to fetch resource by ID");
      throw new AppError("Failed to fetch resource details", { statusCode: 500 });
    }
  }

  /**
   * Create an official or community resource from the admin panel
   */
  async createResource(
    payload: CreateAdminResourcePayload,
    adminUserId?: string
  ): Promise<RoadmapResource> {
    if (!payload.title || !payload.title.trim()) {
      throw AppError.badRequest("Resource title is required");
    }

    if (!payload.url || !payload.url.trim()) {
      throw AppError.badRequest("Resource URL is required");
    }

    if (!payload.url.startsWith("http://") && !payload.url.startsWith("https://")) {
      throw AppError.badRequest("Resource URL must be a valid HTTP or HTTPS address");
    }

    if (!payload.type || !payload.type.trim()) {
      throw AppError.badRequest("Resource type is required (e.g. Video, Article, Course)");
    }

    if (!payload.roadmapIds || payload.roadmapIds.length === 0) {
      throw AppError.badRequest("At least one roadmap must be assigned to this resource");
    }

    try {
      const created = await this.roadmapResourceAdminRepo.createResource(
        payload,
        adminUserId
      );

      // Invalidate relevant Redis caches
      await this.roadmapResourceCache.invalidateResourceCaches(created.id);

      logger.info(
        { id: created.id, title: created.title, adminUserId },
        "Created roadmap resource successfully via admin"
      );

      return await this.hydrateAuthor(created);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, payload }, "Failed to create admin resource");
      throw new AppError("Failed to create resource", { statusCode: 500 });
    }
  }

  /**
   * Update an existing resource.
   * GUARANTEE: Never alters or overwrites the original author (submittedBy)!
   */
  async updateResource(
    id: string,
    payload: UpdateAdminResourcePayload
  ): Promise<RoadmapResource> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource ID is required");
    }

    if (payload.url !== undefined) {
      if (!payload.url.trim()) {
        throw AppError.badRequest("Resource URL cannot be empty");
      }
      if (!payload.url.startsWith("http://") && !payload.url.startsWith("https://")) {
        throw AppError.badRequest("Resource URL must be a valid HTTP or HTTPS address");
      }
    }

    try {
      const updated = await this.roadmapResourceAdminRepo.updateResource(
        id,
        payload
      );

      if (!updated) {
        throw AppError.notFound(`Resource with ID '${id}' not found`);
      }

      // Invalidate caches
      await this.roadmapResourceCache.invalidateResourceCaches(id);

      logger.info(
        { id, title: updated.title },
        "Updated roadmap resource successfully via admin (author preserved)"
      );

      return await this.hydrateAuthor(updated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id, payload }, "Failed to update resource");
      throw new AppError("Failed to update resource", { statusCode: 500 });
    }
  }

  /**
   * Moderate resource status (approve, reject, archive, set pending)
   */
  async moderateResource(
    id: string,
    payload: ModerateResourcePayload,
    adminUserId: string
  ): Promise<RoadmapResource> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource ID is required");
    }

    const validStatuses = ["approved", "rejected", "archived", "pending"];
    if (!validStatuses.includes(payload.status)) {
      throw AppError.badRequest(
        `Invalid status '${payload.status}'. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    try {
      const moderated = await this.roadmapResourceAdminRepo.moderateResource(
        id,
        payload,
        adminUserId
      );

      if (!moderated) {
        throw AppError.notFound(`Resource with ID '${id}' not found`);
      }

      // Invalidate public and detail caches
      await this.roadmapResourceCache.invalidateResourceCaches(id);

      logger.info(
        { id, status: payload.status, adminUserId },
        "Moderated roadmap resource status successfully"
      );

      return await this.hydrateAuthor(moderated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id, payload }, "Failed to moderate resource");
      throw new AppError("Failed to moderate resource status", { statusCode: 500 });
    }
  }

  /**
   * Permanently delete a resource
   */
  async deleteResource(id: string): Promise<boolean> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource ID is required");
    }

    try {
      const deleted = await this.roadmapResourceAdminRepo.deleteResource(id);
      if (!deleted) {
        throw AppError.notFound(`Resource with ID '${id}' not found`);
      }

      await this.roadmapResourceCache.invalidateResourceCaches(id);

      logger.info({ id }, "Deleted roadmap resource successfully via admin");
      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id }, "Failed to delete resource");
      throw new AppError("Failed to delete resource", { statusCode: 500 });
    }
  }

  /**
   * Fetch aggregate resource moderation stats
   */
  async getStats(): Promise<AdminResourceStats> {
    try {
      return await this.roadmapResourceAdminRepo.getStats();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to fetch admin resource stats");
      throw new AppError("Failed to fetch resource stats", { statusCode: 500 });
    }
  }

  // ==========================================
  // AUTHOR PROFILE HYDRATION HELPERS
  // ==========================================

  private async hydrateAuthor(
    resource: RoadmapResource
  ): Promise<RoadmapResource> {
    const [hydrated] = await this.hydrateAuthors([resource]);
    return hydrated;
  }

  private async hydrateAuthors(
    resources: RoadmapResource[]
  ): Promise<RoadmapResource[]> {
    const uniqueIds = Array.from(
      new Set(
        resources
          .map((resource) => resource.submittedBy?.userId)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (uniqueIds.length === 0) return resources;

    const userEntries = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          let user = await this.userRepository.findById(id);
          if (!user && id.startsWith("user_")) {
            user = await this.userRepository.findByClerkId(id);
          }
          return [id, user] as const;
        } catch (userErr) {
          logger.warn(
            { err: userErr, userId: id },
            "Failed to hydrate resource author details from user repository"
          );
          return [id, null] as const;
        }
      })
    );

    const usersById = new Map(
      userEntries.filter((entry) => entry[1] != null)
    );

    return resources.map((resource) => {
      const userId = resource.submittedBy?.userId;
      if (!userId) return resource;
      const user = usersById.get(userId);
      if (!user) return resource;

      resource.submittedBy = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName || null,
        avatarUrl: user.avatarUrl || null,
        submittedAt: resource.submittedBy?.submittedAt,
      };
      return resource;
    });
  }
}

