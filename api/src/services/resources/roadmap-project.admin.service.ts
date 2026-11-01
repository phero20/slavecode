import type { ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { AppError } from "../../utils/app-error";
import type { IUserRepository } from "../../repositories/user/user.repository";
import type { RoadmapProjectCache } from "../../cache/resources/roadmap-project.cache";
import type {
  AdminProjectFilter,
  AdminProjectStats,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
  ModerateProjectPayload,
  PaginatedAdminProjectsResult,
  IRoadmapProjectAdminRepository,
  IRoadmapProjectAdminService,
} from "../../types/resources/roadmap-project.admin.types";
import type { RoadmapProject } from "../../mongo/models/roadmap-project.model";

const logger = createLogger("roadmap-project.admin.service");

export class RoadmapProjectAdminService implements IRoadmapProjectAdminService {
  private readonly roadmapProjectAdminRepo: IRoadmapProjectAdminRepository;
  private readonly userRepository: IUserRepository;
  private readonly roadmapProjectCache: RoadmapProjectCache;

  constructor({
    roadmapProjectAdminRepository,
    userRepository,
    roadmapProjectCache,
  }: ICradle) {
    this.roadmapProjectAdminRepo = roadmapProjectAdminRepository;
    this.userRepository = userRepository;
    this.roadmapProjectCache = roadmapProjectCache;
  }

  /**
   * Fetch all projects for admin dashboard with search, filter, and pagination
   */
  async getAllProjects(
    filter?: AdminProjectFilter
  ): Promise<PaginatedAdminProjectsResult> {
    try {
      const result = await this.roadmapProjectAdminRepo.getAllProjects(filter);
      const hydratedProjects = await this.hydrateAuthors(result.projects);

      return {
        ...result,
        projects: hydratedProjects,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, filter }, "Failed to fetch admin projects");
      throw new AppError("Failed to fetch administrative projects", {
        statusCode: 500,
      });
    }
  }

  /**
   * Fetch single project details by slug or ID
   */
  async getProjectBySlugOrId(slugOrId: string): Promise<RoadmapProject> {
    if (!slugOrId || !slugOrId.trim()) {
      throw AppError.badRequest("Project identifier is required");
    }

    try {
      let project = await this.roadmapProjectAdminRepo.getProjectById(slugOrId);
      if (!project) {
        project = await this.roadmapProjectAdminRepo.getProjectBySlug(slugOrId);
      }

      if (!project) {
        throw AppError.notFound(`Project '${slugOrId}' not found`);
      }

      return await this.hydrateAuthor(project);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slugOrId }, "Failed to fetch project by slug or ID");
      throw new AppError("Failed to fetch project details", { statusCode: 500 });
    }
  }

  /**
   * Create an official or community project from the admin dashboard
   */
  async createProject(
    payload: CreateAdminProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject> {
    if (!payload.title || !payload.title.trim()) {
      throw AppError.badRequest("Project title is required");
    }

    if (!payload.description || !payload.description.trim()) {
      throw AppError.badRequest("Project description is required");
    }

    if (!payload.difficulty) {
      throw AppError.badRequest("Project difficulty level is required");
    }

    if (!payload.roadmapIds || payload.roadmapIds.length === 0) {
      throw AppError.badRequest("At least one roadmap must be assigned to this project");
    }

    try {
      const created = await this.roadmapProjectAdminRepo.createProject(
        payload,
        adminUserId
      );

      // Invalidate caches non-blockingly
      this.invalidateCachesSafe(created.slug);

      return await this.hydrateAuthor(created);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, payload }, "Failed to create project");
      throw new AppError("Failed to create project", { statusCode: 500 });
    }
  }

  /**
   * Update an existing project
   * STRICT GUARANTEE: Never alters or overwrites the original author (submittedBy)
   */
  async updateProject(
    slugOrId: string,
    payload: UpdateAdminProjectPayload
  ): Promise<RoadmapProject> {
    if (!slugOrId || !slugOrId.trim()) {
      throw AppError.badRequest("Project identifier is required");
    }

    try {
      const updated = await this.roadmapProjectAdminRepo.updateProject(
        slugOrId,
        payload
      );

      if (!updated) {
        throw AppError.notFound(`Project '${slugOrId}' not found to update`);
      }

      // Invalidate caches non-blockingly
      this.invalidateCachesSafe(updated.slug);

      return await this.hydrateAuthor(updated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slugOrId }, "Failed to update project");
      throw new AppError("Failed to update project", { statusCode: 500 });
    }
  }

  /**
   * Fast moderation update (approve, reject, archive)
   */
  async moderateProject(
    slugOrId: string,
    payload: ModerateProjectPayload,
    adminUserId?: string
  ): Promise<RoadmapProject> {
    if (!slugOrId || !slugOrId.trim()) {
      throw AppError.badRequest("Project identifier is required");
    }

    if (payload.status === "rejected" && !payload.rejectionReason?.trim()) {
      throw AppError.badRequest(
        "A rejection reason must be provided when rejecting a project"
      );
    }

    try {
      const updated = await this.roadmapProjectAdminRepo.moderateProject(
        slugOrId,
        payload,
        adminUserId
      );

      if (!updated) {
        throw AppError.notFound(`Project '${slugOrId}' not found to moderate`);
      }

      // Invalidate caches non-blockingly
      this.invalidateCachesSafe(updated.slug);

      return await this.hydrateAuthor(updated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slugOrId, payload }, "Failed to moderate project");
      throw new AppError("Failed to moderate project", { statusCode: 500 });
    }
  }

  /**
   * Delete a project permanently
   */
  async deleteProject(slugOrId: string): Promise<boolean> {
    if (!slugOrId || !slugOrId.trim()) {
      throw AppError.badRequest("Project identifier is required");
    }

    try {
      const success = await this.roadmapProjectAdminRepo.deleteProject(slugOrId);
      if (!success) {
        throw AppError.notFound(`Project '${slugOrId}' not found to delete`);
      }

      // Invalidate caches non-blockingly
      this.invalidateCachesSafe(slugOrId);

      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slugOrId }, "Failed to delete project");
      throw new AppError("Failed to delete project", { statusCode: 500 });
    }
  }

  /**
   * Get high-level aggregated statistics
   */
  async getStats(): Promise<AdminProjectStats> {
    try {
      return await this.roadmapProjectAdminRepo.getStats();
    } catch (error: any) {
      logger.error({ err: error }, "Failed to fetch project stats");
      throw new AppError("Failed to fetch project statistics", {
        statusCode: 500,
      });
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private invalidateCachesSafe(slug?: string) {
    Promise.resolve(this.roadmapProjectCache.invalidateProjectCaches(slug)).catch(
      (err) => {
        logger.error({ err, slug }, "Error during background project cache invalidation");
      }
    );
  }

  private async hydrateAuthor(
    project: RoadmapProject
  ): Promise<RoadmapProject> {
    const userId = project.submittedBy?.userId;
    if (!userId) return project;

    try {
      let user = await this.userRepository.findById(userId);
      if (!user && userId.startsWith("user_")) {
        user = await this.userRepository.findByClerkId(userId);
      }
      if (user) {
        return {
          ...project,
          submittedBy: {
            ...project.submittedBy,
            username: user.username || project.submittedBy?.username,
            fullName: user.fullName || project.submittedBy?.fullName,
            avatarUrl: user.avatarUrl || project.submittedBy?.avatarUrl,
          },
        };
      }
    } catch (err) {
      logger.warn({ err, userId }, "Failed to hydrate author user details");
    }

    return project;
  }

  private async hydrateAuthors(
    projects: RoadmapProject[]
  ): Promise<RoadmapProject[]> {
    const uniqueIds = Array.from(
      new Set(
        projects
          .map((project) => project.submittedBy?.userId)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (uniqueIds.length === 0) return projects;

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
            "Failed to hydrate project author details from user repository"
          );
          return [id, null] as const;
        }
      })
    );

    const usersById = new Map(
      userEntries.filter((entry): entry is [string, NonNullable<typeof entry[1]>] => entry[1] != null)
    );

    return projects.map((project) => {
      const userId = project.submittedBy?.userId;
      if (!userId) return project;
      const user = usersById.get(userId);
      if (!user) return project;

      return {
        ...project,
        submittedBy: {
          ...project.submittedBy,
          username: user.username || project.submittedBy?.username,
          fullName: user.fullName || project.submittedBy?.fullName,
          avatarUrl: user.avatarUrl || project.submittedBy?.avatarUrl,
        },
      };
    });
  }
}
