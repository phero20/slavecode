import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { RoadmapProject } from "../../mongo/models/roadmap-project.model";
import { type RoadmapProjectService } from "../../services/resources/roadmap-project.service";
import {
  type IRoadmapProjectService,
  type GetAllProjectsOptions,
  type PaginatedProjectsResult,
  type ProjectCategorySummary,
  type UserProjectsResult,
  type GetUserProjectsOptions,
  type CreateProjectServiceInput,
  type UpdateProjectServiceInput,
  type ProjectSortOption,
} from "../../types/resources";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("roadmap-project.cache");

export class RoadmapProjectCache implements IRoadmapProjectService {
  private readonly CACHE_TTL_DETAIL = 86400; // 24 hours for project detail and categories
  private readonly CACHE_TTL_LIST = 1800; // 30 minutes for catalog pagination
  private readonly CACHE_TTL_POPULAR = 3600; // 1 hour for popular & roadmap lists

  private readonly rawRoadmapProjectService: RoadmapProjectService;

  constructor({ rawRoadmapProjectService }: ICradle) {
    this.rawRoadmapProjectService = rawRoadmapProjectService;
  }

  /**
   * Get all projects for a specific roadmap (e.g. 'frontend', 'backend')
   */
  async getProjectsByRoadmap(
    roadmapSlug: string,
    difficulty?: string,
    sort?: ProjectSortOption,
  ): Promise<RoadmapProject[]> {
    const cleanSlug = (roadmapSlug || "").toLowerCase().trim();
    const cleanDiff = difficulty ? difficulty.toLowerCase().trim() : "all";
    const sortVal = sort ? sort.toLowerCase().trim() : "default";
    const key = `projects:roadmap:${cleanSlug}:${cleanDiff}:${sortVal}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, key }, "Redis get error for roadmap projects");
    }

    const projects = await this.rawRoadmapProjectService.getProjectsByRoadmap(
      roadmapSlug,
      difficulty,
      sort,
    );

    if (projects && projects.length > 0) {
      try {
        await redis.set(
          key,
          JSON.stringify(projects),
          "EX",
          this.CACHE_TTL_POPULAR,
        );
      } catch (err) {
        logger.error({ err, key }, "Redis set error for roadmap projects");
      }
    }

    return projects;
  }

  /**
   * Get complete details of a single project by its slug
   */
  async getProjectBySlug(
    slug: string,
    requestingUserId?: string,
    userRole?: string,
    clerkUserId?: string,
  ): Promise<RoadmapProject> {
    const cleanSlug = (slug || "").toLowerCase().trim();
    const key = `project:slug:${cleanSlug}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error(
        { err, slug: cleanSlug },
        "Redis get error for project detail",
      );
    }

    const project = await this.rawRoadmapProjectService.getProjectBySlug(
      slug,
      requestingUserId,
      userRole,
      clerkUserId,
    );

    // Only cache approved projects in public Redis (pending/updated projects stay private)
    if (project && project.status === "approved") {
      try {
        await redis.set(
          key,
          JSON.stringify(project),
          "EX",
          this.CACHE_TTL_DETAIL,
        );
      } catch (err) {
        logger.error(
          { err, slug: cleanSlug },
          "Redis set error for project detail",
        );
      }
    }

    return project;
  }

  /**
   * Explore / search projects across all roadmaps with pagination
   */
  async getAllProjects(
    options?: GetAllProjectsOptions,
  ): Promise<PaginatedProjectsResult> {
    const hasSearch = Boolean(
      options?.search && options.search.trim().length > 0,
    );

    // Dynamic search queries bypass Redis to prevent memory bloat and stale partial matches
    if (hasSearch) {
      return this.rawRoadmapProjectService.getAllProjects(options);
    }

    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
    const roadmapSlug = options?.roadmapSlug
      ? options.roadmapSlug.toLowerCase().trim()
      : "all";
    const difficulty = options?.difficulty
      ? options.difficulty.toLowerCase().trim()
      : "all";
    const topic = options?.topic ? options.topic.toLowerCase().trim() : "all";
    const sort = options?.sort ? options.sort.toLowerCase().trim() : "default";

    const key = `projects:catalog:${roadmapSlug}:${difficulty}:${topic}:${sort}:${page}:${limit}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error(
        { err, key },
        "Redis get error for paginated projects catalog",
      );
    }

    const result = await this.rawRoadmapProjectService.getAllProjects(options);

    try {
      await redis.set(key, JSON.stringify(result), "EX", this.CACHE_TTL_LIST);
    } catch (err) {
      logger.error(
        { err, key },
        "Redis set error for paginated projects catalog",
      );
    }

    return result;
  }

  /**
   * Get top engagement / popular projects
   */
  async getPopularProjects(limit = 10): Promise<RoadmapProject[]> {
    const key = `projects:popular:${limit}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err, limit }, "Redis get error for popular projects");
    }

    const projects =
      await this.rawRoadmapProjectService.getPopularProjects(limit);

    if (projects && projects.length > 0) {
      try {
        await redis.set(
          key,
          JSON.stringify(projects),
          "EX",
          this.CACHE_TTL_POPULAR,
        );
      } catch (err) {
        logger.error({ err, limit }, "Redis set error for popular projects");
      }
    }

    return projects;
  }

  /**
   * Aggregate dynamic roadmap categories and counts for all approved projects
   */
  async getProjectCategories(): Promise<ProjectCategorySummary[]> {
    const key = "projects:categories";

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ err }, "Redis get error for project categories");
    }

    const categories =
      await this.rawRoadmapProjectService.getProjectCategories();

    if (categories && categories.length > 0) {
      try {
        await redis.set(
          key,
          JSON.stringify(categories),
          "EX",
          this.CACHE_TTL_DETAIL,
        );
      } catch (err) {
        logger.error({ err }, "Redis set error for project categories");
      }
    }

    return categories;
  }

  /**
   * Get user projects via raw service (dynamic and depends on caller auth)
   */
  async getUserProjects(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserProjectsOptions,
  ): Promise<UserProjectsResult> {
    return await this.rawRoadmapProjectService.getUserProjects(
      username,
      requestingUserId,
      clerkUserId,
      options,
    );
  }

  /**
   * Create a new community project (created as pending, no public catalog cache invalidation needed)
   */
  async createProject(
    input: CreateProjectServiceInput,
  ): Promise<RoadmapProject> {
    return await this.rawRoadmapProjectService.createProject(input);
  }

  /**
   * Update an existing community project & invalidate affected caches
   */
  async updateProject(
    slug: string,
    input: UpdateProjectServiceInput,
    userId: string,
  ): Promise<RoadmapProject> {
    const project = await this.rawRoadmapProjectService.updateProject(
      slug,
      input,
      userId,
    );
    await this.invalidateProjectCaches(slug);
    if (
      project.slug &&
      project.slug.toLowerCase().trim() !== slug.toLowerCase().trim()
    ) {
      await this.invalidateProjectCaches(project.slug);
    }
    return project;
  }

  /**
   * Delete an existing community project & invalidate affected caches
   */
  async deleteProject(slug: string, userId: string): Promise<boolean> {
    const result = await this.rawRoadmapProjectService.deleteProject(
      slug,
      userId,
    );
    await this.invalidateProjectCaches(slug);
    return result;
  }

  /**
   * Helper to invalidate project cache keys and patterns non-blockingly using SCAN
   */
  public async invalidateProjectCaches(slug?: string): Promise<void> {
    try {
      const keysToDelete: string[] = ["projects:categories"];

      if (slug) {
        keysToDelete.push(`project:slug:${slug.toLowerCase().trim()}`);
      }

      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
      }

      const patterns = [
        "projects:catalog:*",
        "projects:roadmap:*",
        "projects:popular:*",
      ];

      let totalScannedDeleted = 0;
      for (const pattern of patterns) {
        totalScannedDeleted += await this.deleteKeysByPattern(pattern);
      }

      logger.info(
        {
          slug,
          directDeleted: keysToDelete.length,
          patternDeleted: totalScannedDeleted,
        },
        "Invalidated project caches using SCAN",
      );
    } catch (err) {
      logger.error(
        { slug, err },
        "Redis invalidation error for project caches",
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
