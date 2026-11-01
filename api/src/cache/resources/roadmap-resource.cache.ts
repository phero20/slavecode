import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { RoadmapResource } from "../../mongo/models/roadmap-resource.model";
import { type RoadmapResourceService } from "../../services/resources/roadmap-resource.service";
import {
  type IRoadmapResourceService,
  type GetAllResourcesOptions,
  type PaginatedResourcesResult,
  type UserResourcesResult,
  type GetUserResourcesOptions,
  type CreateResourceServiceInput,
  type UpdateResourceServiceInput,
  type ResourceSortOption,
} from "../../types/resources";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("roadmap-resource.cache");

export class RoadmapResourceCache implements IRoadmapResourceService {
  private readonly CACHE_TTL_DETAIL = 86400; // 24 hours for resource detail
  private readonly CACHE_TTL_LIST = 1800; // 30 minutes for catalog pagination
  private readonly CACHE_TTL_POPULAR = 3600; // 1 hour for roadmap lists

  private readonly rawRoadmapResourceService: RoadmapResourceService;

  constructor({ rawRoadmapResourceService }: ICradle) {
    this.rawRoadmapResourceService = rawRoadmapResourceService;
  }

  /**
   * Get all approved resources for a specific roadmap
   */
  async getResourcesByRoadmap(
    roadmapSlug: string,
    type?: string,
    sort?: ResourceSortOption,
  ): Promise<RoadmapResource[]> {
    const cleanSlug = (roadmapSlug || "").toLowerCase().trim();
    const cleanType = type ? type.toLowerCase().trim() : "all";
    const sortVal = sort ? sort.toLowerCase().trim() : "default";
    const key = `resources:roadmap:${cleanSlug}:${cleanType}:${sortVal}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for roadmap resources");
    }

    const resources = await this.rawRoadmapResourceService.getResourcesByRoadmap(
      roadmapSlug,
      type,
      sort,
    );

    if (resources && resources.length > 0) {
      try {
        await redis.set(
          key,
          JSON.stringify(resources),
          "EX",
          this.CACHE_TTL_POPULAR,
        );
      } catch (err) {
        logger.error({ err, key }, "Redis set error for roadmap resources");
      }
    }

    return resources;
  }

  /**
   * Get complete details of a single resource by its id
   */
  async getResourceById(
    id: string,
    requestingUserId?: string,
    userRole?: string,
    clerkUserId?: string,
  ): Promise<RoadmapResource> {
    const cleanId = (id || "").trim();
    const key = `resource:id:${cleanId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, id: cleanId }, "Redis get error for resource detail");
    }

    const resource = await this.rawRoadmapResourceService.getResourceById(
      id,
      requestingUserId,
      userRole,
      clerkUserId,
    );

    // Only cache approved resources in public Redis (pending resources stay private)
    if (resource && resource.status === "approved") {
      try {
        await redis.set(
          key,
          JSON.stringify(resource),
          "EX",
          this.CACHE_TTL_DETAIL,
        );
      } catch (err) {
        logger.error(
          { err, id: cleanId },
          "Redis set error for resource detail",
        );
      }
    }

    return resource;
  }

  /**
   * Explore / search approved resources across all roadmaps with pagination
   */
  async getAllResources(
    options?: GetAllResourcesOptions,
  ): Promise<PaginatedResourcesResult> {
    const hasSearch = Boolean(
      options?.search && options.search.trim().length > 0,
    );

    // Dynamic search queries bypass Redis to prevent memory bloat and stale partial matches
    if (hasSearch) {
      return this.rawRoadmapResourceService.getAllResources(options);
    }

    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
    const roadmapSlug = options?.roadmapSlug
      ? options.roadmapSlug.toLowerCase().trim()
      : "all";
    const type = options?.type ? options.type.toLowerCase().trim() : "all";
    const sort = options?.sort ? options.sort.toLowerCase().trim() : "default";

    const key = `resources:catalog:${roadmapSlug}:${type}:${sort}:${page}:${limit}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error(
        { err, key },
        "Redis get error for paginated resources catalog",
      );
    }

    const result = await this.rawRoadmapResourceService.getAllResources(options);

    try {
      await redis.set(key, JSON.stringify(result), "EX", this.CACHE_TTL_LIST);
    } catch (err) {
      logger.error(
        { err, key },
        "Redis set error for paginated resources catalog",
      );
    }

    return result;
  }

  /**
   * Get user resources via raw service (dynamic and depends on caller auth)
   */
  async getUserResources(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserResourcesOptions,
  ): Promise<UserResourcesResult> {
    return await this.rawRoadmapResourceService.getUserResources(
      username,
      requestingUserId,
      clerkUserId,
      options,
    );
  }

  /**
   * Create a new community resource (created as pending, no public catalog cache invalidation needed)
   */
  async createResource(
    input: CreateResourceServiceInput,
  ): Promise<RoadmapResource> {
    return await this.rawRoadmapResourceService.createResource(input);
  }

  /**
   * Update an existing community resource & invalidate affected caches
   */
  async updateResource(
    id: string,
    input: UpdateResourceServiceInput,
    userId: string,
  ): Promise<RoadmapResource> {
    const resource = await this.rawRoadmapResourceService.updateResource(
      id,
      input,
      userId,
    );
    await this.invalidateResourceCaches(id);
    return resource;
  }

  /**
   * Delete an existing community resource & invalidate affected caches
   */
  async deleteResource(id: string, userId: string): Promise<boolean> {
    const result = await this.rawRoadmapResourceService.deleteResource(
      id,
      userId,
    );
    await this.invalidateResourceCaches(id);
    return result;
  }

  /**
   * Helper to invalidate resource cache keys and patterns non-blockingly using SCAN
   */
  public async invalidateResourceCaches(id?: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      if (id) {
        keysToDelete.push(`resource:id:${id.trim()}`);
      }

      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
      }

      const patterns = ["resources:catalog:*", "resources:roadmap:*"];

      let totalScannedDeleted = 0;
      for (const pattern of patterns) {
        totalScannedDeleted += await this.deleteKeysByPattern(pattern);
      }

      logger.info(
        {
          id,
          directDeleted: keysToDelete.length,
          patternDeleted: totalScannedDeleted,
        },
        "Invalidated resource caches using SCAN",
      );
    } catch (err) {
      logger.error(
        { id, err },
        "Redis invalidation error for resource caches",
      );
    }
  }

  /**
   * Delete matching Redis keys in non-blocking batches using scanStream
   */
  private async deleteKeysByPattern(pattern: string): Promise<number> {
    return new Promise((resolve) => {
      const stream = redis.scanStream({ match: pattern, count: 100 });
      let deletedCount = 0;

      stream.on("data", async (keys: string[]) => {
        if (keys.length > 0) {
          stream.pause();
          try {
            await redis.del(...keys);
            deletedCount += keys.length;
          } catch (err) {
            logger.error({ err, pattern }, "Error deleting scanned Redis keys");
          } finally {
            stream.resume();
          }
        }
      });

      stream.on("end", () => resolve(deletedCount));
      stream.on("error", (err) => {
        logger.error({ err, pattern }, "Redis scanStream error");
        resolve(deletedCount);
      });
    });
  }
}
