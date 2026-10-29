import {
  type RoadmapProject,
  type ProjectDifficulty,
} from "../../mongo/models/roadmap-project.model";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";
import {
  type IRoadmapProjectRepository,
  type GetProjectsFilter,
  type ProjectCategorySummary,
  type GetAllProjectsOptions,
  type PaginatedProjectsResult,
  type UserProjectsResult,
  type GetUserProjectsOptions,
  type CreateProjectServiceInput,
  type UpdateProjectServiceInput,
  type IRoadmapProjectService,
  type ProjectSortOption,
} from "../../types/resources";

// Re-export types for backward compatibility
export type {
  ProjectSortOption,
  GetAllProjectsOptions,
  PaginatedProjectsResult,
  UserProjectsResult,
  GetUserProjectsOptions,
  CreateProjectServiceInput,
  UpdateProjectServiceInput,
  IRoadmapProjectService,
};

const logger = createLogger("roadmap-project.service");

const VALID_DIFFICULTIES: ProjectDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const RESERVED_PROJECT_SLUGS = new Set([
  "new",
  "create",
  "edit",
  "submit",
  "user",
  "explore",
  "categories",
]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class RoadmapProjectService implements IRoadmapProjectService {
  private readonly roadmapProjectRepository: IRoadmapProjectRepository;
  private readonly userRepository: IUserRepository;

  constructor({ roadmapProjectRepository, userRepository }: ICradle) {
    this.roadmapProjectRepository = roadmapProjectRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get all projects for a specific roadmap (e.g. 'frontend', 'backend')
   * Optional difficulty filter: 'beginner' | 'intermediate' | 'advanced'
   */
  async getProjectsByRoadmap(
    roadmapSlug: string,
    difficulty?: string,
    sort?: ProjectSortOption,
  ): Promise<RoadmapProject[]> {
    if (!roadmapSlug || !roadmapSlug.trim()) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    let parsedDifficulty: ProjectDifficulty | undefined;
    if (difficulty && difficulty.trim().length > 0) {
      const lower = difficulty.toLowerCase().trim() as ProjectDifficulty;
      if (!VALID_DIFFICULTIES.includes(lower)) {
        throw AppError.badRequest(
          `Invalid difficulty '${difficulty}'. Allowed values: ${VALID_DIFFICULTIES.join(", ")}`,
        );
      }
      parsedDifficulty = lower;
    }

    try {
      return await this.roadmapProjectRepository.getProjectsByRoadmap(
        roadmapSlug,
        parsedDifficulty,
        sort,
      );
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, roadmapSlug, difficulty, sort },
        "Failed to fetch roadmap projects",
      );
      throw new AppError("Failed to fetch roadmap projects", {
        statusCode: 500,
      });
    }
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
    if (!slug || !slug.trim()) {
      throw AppError.badRequest("Project slug is required");
    }

    try {
      const project =
        await this.roadmapProjectRepository.getProjectBySlug(slug);
      if (!project) {
        throw AppError.notFound(`Project '${slug}' not found`);
      }

      // If project is not yet approved (pending or updated), only author can view it
      if (project.status !== "approved") {
        const isAuthor = Boolean(
          requestingUserId && project.submittedBy?.userId === requestingUserId,
        );

        if (!isAuthor) {
          throw AppError.notFound(`Project '${slug}' not found`);
        }
      }

      return await this.hydrateAuthor(project);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to fetch project details");
      throw new AppError("Failed to fetch project details", {
        statusCode: 500,
      });
    }
  }

  /**
   * Explore / search projects across all roadmaps with pagination
   */
  async getAllProjects(
    options?: GetAllProjectsOptions,
  ): Promise<PaginatedProjectsResult> {
    try {
      let parsedDifficulty: ProjectDifficulty | undefined;
      if (options?.difficulty && options.difficulty.trim().length > 0) {
        const lower = options.difficulty
          .toLowerCase()
          .trim() as ProjectDifficulty;
        if (!VALID_DIFFICULTIES.includes(lower)) {
          throw AppError.badRequest(
            `Invalid difficulty '${options.difficulty}'. Allowed values: ${VALID_DIFFICULTIES.join(", ")}`,
          );
        }
        parsedDifficulty = lower;
      }

      const page = Math.max(1, Number(options?.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
      const skip = (page - 1) * limit;

      const filter: GetProjectsFilter = {
        roadmapSlug: options?.roadmapSlug,
        difficulty: parsedDifficulty,
        search: options?.search,
        topic: options?.topic,
        skip,
        limit,
        sort: options?.sort,
      };

      const { projects, total } =
        await this.roadmapProjectRepository.getAllProjects(filter);

      return {
        projects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, options },
        "Failed to search projects catalog",
      );
      throw new AppError("Failed to search projects catalog", {
        statusCode: 500,
      });
    }
  }

  /**
   * Get top engagement / popular projects
   */
  async getPopularProjects(limit = 10): Promise<RoadmapProject[]> {
    try {
      return await this.roadmapProjectRepository.getPopularProjects(limit);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, limit }, "Failed to fetch popular projects");
      throw new AppError("Failed to fetch popular projects", {
        statusCode: 500,
      });
    }
  }

  /**
   * Aggregate dynamic roadmap categories and counts for all approved projects
   */
  async getProjectCategories(): Promise<ProjectCategorySummary[]> {
    try {
      return await this.roadmapProjectRepository.getProjectCategories();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to aggregate project categories");
      throw new AppError("Failed to fetch project categories", {
        statusCode: 500,
      });
    }
  }

  /**
   * Get projects submitted by a specific user (by username).
   * If the requester is the author (owner), all project statuses (or optional status filter) are returned.
   * If the requester is an external visitor, only "approved" projects are returned.
   */
  async getUserProjects(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserProjectsOptions,
  ): Promise<UserProjectsResult> {
    if (!username || !username.trim()) {
      throw AppError.badRequest("Username is required");
    }

    const cleanUsername = username.trim();
    const targetUser = await this.userRepository.findByUsername(cleanUsername);
    if (!targetUser) {
      throw AppError.notFound(`User '${cleanUsername}' not found`);
    }

    const isOwner = Boolean(
      (requestingUserId && requestingUserId === targetUser.id) ||
      (clerkUserId && clerkUserId === targetUser.clerkId),
    );

    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 10));

    const effectiveStatus = isOwner ? options?.status : "approved";
    const userIds = [targetUser.id, targetUser.clerkId].filter(
      Boolean,
    ) as string[];

    try {
      const { projects, total } =
        await this.roadmapProjectRepository.getUserProjects(
          userIds,
          effectiveStatus,
          { page, limit },
        );

      const hydratedProjects = await Promise.all(
        projects.map((p) => this.hydrateAuthor(p)),
      );

      return {
        projects: hydratedProjects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        isOwner,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, username: cleanUsername, requestingUserId },
        "Failed to fetch user projects",
      );
      throw new AppError("Failed to fetch user projects", {
        statusCode: 500,
      });
    }
  }

  /**
   * Create a new community project
   */
  async createProject(
    input: CreateProjectServiceInput,
  ): Promise<RoadmapProject> {
    if (!input.title || !input.title.trim()) {
      throw AppError.badRequest("Project title is required");
    }

    if (!input.description || !input.description.trim()) {
      throw AppError.badRequest("Project description is required");
    }

    if (!input.userId) {
      throw AppError.unauthorized(
        "User identity is required to create a project",
      );
    }

    if (!input.difficulty || !VALID_DIFFICULTIES.includes(input.difficulty)) {
      throw AppError.badRequest(
        `Invalid difficulty '${input.difficulty}'. Allowed values: ${VALID_DIFFICULTIES.join(", ")}`,
      );
    }

    if (!input.roadmapIds || input.roadmapIds.length === 0) {
      throw AppError.badRequest("At least one roadmap category is required");
    }

    try {
      // 1. Generate unique slug
      let baseSlug = slugify(input.title);
      if (!baseSlug) {
        baseSlug = `project-${Date.now().toString(36)}`;
      }

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (
        RESERVED_PROJECT_SLUGS.has(uniqueSlug) ||
        (await this.roadmapProjectRepository.existsBySlug(uniqueSlug))
      ) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // 2. Build domain model
      const previewImage =
        input.content?.previewImage &&
        input.content.previewImage.trim().length > 0
          ? input.content.previewImage.trim()
          : null;

      const newProject: Partial<RoadmapProject> = {
        slug: uniqueSlug,
        title: input.title.trim(),
        description: input.description.trim(),
        difficulty: input.difficulty,
        roadmapIds: input.roadmapIds.map((id) => id.toLowerCase().trim()),
        topics: (input.topics || []).map((t) => t.trim()).filter(Boolean),
        skills: (input.skills || []).map((s) => s.trim()).filter(Boolean),
        order: 0,
        type: "code",
        content: {
          overview: input.content?.overview?.trim() || "",
          markdown: input.content?.markdown?.trim() || "",
          previewImage,
          requirements: (input.content?.requirements || []).filter(Boolean),
          checklist: (input.content?.checklist || []).filter(Boolean),
          bonusChallenges: (input.content?.bonusChallenges || []).filter(
            Boolean,
          ),
          suggestedTechStack: (input.content?.suggestedTechStack || []).filter(
            Boolean,
          ),
        },
        origin: "community",
        status: "pending",
        submittedBy: {
          userId: input.userId,
          submittedAt: new Date(),
        },
        stats: {
          startedCount: 0,
          completedCount: 0,
          upvotesCount: 0,
        },
      };

      const created =
        await this.roadmapProjectRepository.createProject(newProject);
      return await this.hydrateAuthor(created);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, title: input.title },
        "Failed to create project",
      );
      throw new AppError("Failed to create project", {
        statusCode: 500,
      });
    }
  }

  /**
   * Update an existing community project
   */
  async updateProject(
    slug: string,
    input: UpdateProjectServiceInput,
    userId: string,
  ): Promise<RoadmapProject> {
    const existing = await this.roadmapProjectRepository.getProjectBySlug(slug);
    if (!existing) {
      throw AppError.notFound(`Project '${slug}' not found`);
    }

    if (
      existing.submittedBy?.userId &&
      existing.submittedBy.userId !== userId
    ) {
      throw AppError.forbidden(
        "You do not have permission to update this project",
      );
    }

    if (input.difficulty && !VALID_DIFFICULTIES.includes(input.difficulty)) {
      throw AppError.badRequest(
        `Invalid difficulty '${input.difficulty}'. Allowed values: ${VALID_DIFFICULTIES.join(", ")}`,
      );
    }

    try {
      const updates: Partial<RoadmapProject> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.description !== undefined)
        updates.description = input.description.trim();
      if (input.difficulty !== undefined) updates.difficulty = input.difficulty;
      if (input.roadmapIds !== undefined) {
        updates.roadmapIds = input.roadmapIds.map((id) =>
          id.toLowerCase().trim(),
        );
      }
      if (input.topics !== undefined) {
        updates.topics = input.topics.map((t) => t.trim()).filter(Boolean);
      }
      if (input.skills !== undefined) {
        updates.skills = input.skills.map((s) => s.trim()).filter(Boolean);
      }
      if (input.content !== undefined) {
        let previewImage = existing.content?.previewImage ?? null;
        if (input.content.previewImage !== undefined) {
          previewImage =
            input.content.previewImage &&
            input.content.previewImage.trim().length > 0
              ? input.content.previewImage.trim()
              : null;
        }

        updates.content = {
          ...existing.content,
          ...input.content,
          previewImage,
          requirements: (input.content.requirements || []).filter(Boolean),
          checklist: (input.content.checklist || []).filter(Boolean),
          bonusChallenges: (input.content.bonusChallenges || []).filter(
            Boolean,
          ),
          suggestedTechStack: (input.content.suggestedTechStack || []).filter(
            Boolean,
          ),
        };
      }

      // When a project is edited, set status to updated awaiting admin review
      updates.status = "updated";

      if (existing.submittedBy) {
        updates.submittedBy = {
          ...existing.submittedBy,
          userId,
        };
      }

      const updated = await this.roadmapProjectRepository.updateProject(
        slug,
        updates,
      );
      if (!updated) {
        throw AppError.notFound(`Failed to update project '${slug}'`);
      }
      return await this.hydrateAuthor(updated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to update project");
      throw new AppError("Failed to update project", {
        statusCode: 500,
      });
    }
  }

  /**
   * Delete an existing community project (only author can delete)
   */
  async deleteProject(slug: string, userId: string): Promise<boolean> {
    if (!slug || !slug.trim()) {
      throw AppError.badRequest("Project slug is required");
    }

    const existing = await this.roadmapProjectRepository.getProjectBySlug(slug);
    if (!existing) {
      throw AppError.notFound(`Project '${slug}' not found`);
    }

    // Official projects cannot be deleted via community endpoint
    if (!existing.submittedBy?.userId) {
      throw AppError.forbidden("Official projects cannot be deleted");
    }

    if (existing.submittedBy.userId !== userId) {
      throw AppError.forbidden(
        "You do not have permission to delete this project",
      );
    }

    try {
      const deleted = await this.roadmapProjectRepository.deleteProject(slug);
      if (!deleted) {
        throw AppError.notFound(`Failed to delete project '${slug}'`);
      }
      logger.info({ slug, userId }, "Successfully deleted community project");
      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to delete project");
      throw new AppError("Failed to delete project", {
        statusCode: 500,
      });
    }
  }

  /**
   * Helper to hydrate community project author details from the user repository.
   * Supports both PostgreSQL UUID and Clerk ID fallbacks.
   */
  private async hydrateAuthor(
    project: RoadmapProject,
  ): Promise<RoadmapProject> {
    if (project.submittedBy?.userId) {
      try {
        let user = await this.userRepository.findById(
          project.submittedBy.userId,
        );
        if (!user && project.submittedBy.userId.startsWith("user_")) {
          user = await this.userRepository.findByClerkId(
            project.submittedBy.userId,
          );
        }
        if (user) {
          project.submittedBy = {
            userId: user.id,
            username: user.username,
            fullName: user.fullName || null,
            avatarUrl: user.avatarUrl || null,
            submittedAt: project.submittedBy.submittedAt,
          };
        }
      } catch (userErr) {
        logger.warn(
          { err: userErr, userId: project.submittedBy.userId },
          "Failed to hydrate project author details from user repository",
        );
      }
    }
    return project;
  }
}
