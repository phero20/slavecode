import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type {
  IResourceService,
  ResourceService,
  GetRoadmapsOptions,
} from "../../services/resources/resource.service";
import type {
  RoadmapSummary,
  RoadmapDetail,
  RoadmapCategory,
} from "../../repositories/resources/resource.repository";
import type { RoadmapTopic } from "../../mongo/models/roadmap-topic.model";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("resource-cache");

export class ResourceCache implements IResourceService {
  private readonly CACHE_TTL = 86400; // 24 hours
  private readonly rawResourceService: ResourceService;

  constructor({ rawResourceService }: ICradle) {
    this.rawResourceService = rawResourceService;
  }

  async getAllRoadmaps(
    options?: GetRoadmapsOptions | string
  ): Promise<RoadmapSummary[]> {
    const category =
      typeof options === "string" ? options : options?.category || "all";
    const query =
      typeof options === "object" ? options?.query?.trim().toLowerCase() : "";

    const key = query
      ? `resource:roadmaps:${category}:search:${query}`
      : `resource:roadmaps:${category}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for roadmaps list");
    }

    const data = await this.rawResourceService.getAllRoadmaps(options);

    if (data && data.length > 0) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, key }, "Redis set error for roadmaps list");
      }
    }

    return data;
  }

  async getRoadmapBySlug(slug: string): Promise<RoadmapDetail> {
    const cleanSlug = slug.toLowerCase().trim();
    const key = `resource:roadmap:${cleanSlug}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, slug: cleanSlug }, "Redis get error for roadmap details");
    }

    const data = await this.rawResourceService.getRoadmapBySlug(cleanSlug);

    if (data) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, slug: cleanSlug }, "Redis set error for roadmap details");
      }
    }

    return data;
  }

  async searchRoadmaps(query: string): Promise<RoadmapSummary[]> {
    const q = query.toLowerCase().trim();
    const key = `resource:search:${q}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, query: q }, "Redis get error for roadmap search");
    }

    const data = await this.rawResourceService.searchRoadmaps(query);

    if (data && data.length > 0) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, query: q }, "Redis set error for roadmap search");
      }
    }

    return data;
  }

  async getCategories(): Promise<RoadmapCategory[]> {
    const key = "resource:categories";

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for categories");
    }

    const data = await this.rawResourceService.getCategories();

    if (data && data.length > 0) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, key }, "Redis set error for categories");
      }
    }

    return data;
  }

  async getTopicByNodeId(
    roadmapSlug: string,
    nodeId: string
  ): Promise<RoadmapTopic> {
    const cleanSlug = roadmapSlug.toLowerCase().trim();
    const cleanNodeId = nodeId.trim();
    const key = `resource:roadmap:${cleanSlug}:topic:${cleanNodeId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for topic details");
    }

    const data = await this.rawResourceService.getTopicByNodeId(
      cleanSlug,
      cleanNodeId
    );

    if (data) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, key }, "Redis set error for topic details");
      }
    }

    return data;
  }

  async getTopicsByRoadmap(
    roadmapSlug: string
  ): Promise<Partial<RoadmapTopic>[]> {
    const cleanSlug = roadmapSlug.toLowerCase().trim();
    const key = `resource:roadmap:${cleanSlug}:topics`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for roadmap topics list");
    }

    const data = await this.rawResourceService.getTopicsByRoadmap(cleanSlug);

    if (data && data.length > 0) {
      try {
        await redis.set(key, JSON.stringify(data), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err, key }, "Redis set error for roadmap topics list");
      }
    }

    return data;
  }

  /**
   * Helper to invalidate roadmap cache keys and patterns non-blockingly using SCAN
   */
  async invalidateRoadmapCaches(slug?: string): Promise<void> {
    try {
      const keysToDelete: string[] = ["resource:categories"];
      if (slug) {
        const cleanSlug = slug.toLowerCase().trim();
        keysToDelete.push(`resource:roadmap:${cleanSlug}`);
        keysToDelete.push(`resource:roadmap:${cleanSlug}:topics`);
      }

      let cursor = "0";
      do {
        const [nextCursor, matchedKeys] = await redis.scan(
          cursor,
          "MATCH",
          "resource:roadmaps:*",
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (matchedKeys.length > 0) {
          keysToDelete.push(...matchedKeys);
        }
      } while (cursor !== "0");

      if (keysToDelete.length > 0) {
        await redis.del(...Array.from(new Set(keysToDelete)));
      }
    } catch (err) {
      logger.error({ err, slug }, "Error invalidating roadmap caches");
    }
  }

  /**
   * Helper to invalidate category cache
   */
  async invalidateCategoryCaches(): Promise<void> {
    try {
      const keysToDelete: string[] = ["resource:categories"];
      let cursor = "0";
      do {
        const [nextCursor, matchedKeys] = await redis.scan(
          cursor,
          "MATCH",
          "resource:roadmaps:*",
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (matchedKeys.length > 0) {
          keysToDelete.push(...matchedKeys);
        }
      } while (cursor !== "0");

      if (keysToDelete.length > 0) {
        await redis.del(...Array.from(new Set(keysToDelete)));
      }
    } catch (err) {
      logger.error({ err }, "Error invalidating category caches");
    }
  }
}
