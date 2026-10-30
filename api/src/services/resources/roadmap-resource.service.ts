import { type RoadmapResource } from "../../mongo/models/roadmap-resource.model";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";
import {
  type IRoadmapResourceRepository,
  type GetRoadmapResourcesFilter,
  type GetAllResourcesOptions,
  type PaginatedResourcesResult,
  type UserResourcesResult,
  type GetUserResourcesOptions,
  type CreateResourceServiceInput,
  type UpdateResourceServiceInput,
  type IRoadmapResourceService,
  type ResourceSortOption,
} from "../../types/resources";

// Re-export types for backward compatibility
export type {
  ResourceSortOption,
  GetAllResourcesOptions,
  PaginatedResourcesResult,
  UserResourcesResult,
  GetUserResourcesOptions,
  CreateResourceServiceInput,
  UpdateResourceServiceInput,
  IRoadmapResourceService,
};

const logger = createLogger("roadmap-resource.service");

export class RoadmapResourceService implements IRoadmapResourceService {
  private readonly roadmapResourceRepository: IRoadmapResourceRepository;
  private readonly userRepository: IUserRepository;

  constructor({ roadmapResourceRepository, userRepository }: ICradle) {
    this.roadmapResourceRepository = roadmapResourceRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get all approved resources for a specific roadmap (e.g. 'frontend', 'backend')
   */
  async getResourcesByRoadmap(
    roadmapSlug: string,
    type?: string,
    sort?: ResourceSortOption,
  ): Promise<RoadmapResource[]> {
    if (!roadmapSlug || !roadmapSlug.trim()) {
      throw AppError.badRequest("Roadmap slug is required");
    }

    try {
      const resources =
        await this.roadmapResourceRepository.getResourcesByRoadmap(
          roadmapSlug,
          type,
          sort,
        );
      return await this.hydrateAuthors(resources);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, roadmapSlug, type, sort },
        "Failed to fetch roadmap resources",
      );
      throw new AppError("Failed to fetch roadmap resources", {
        statusCode: 500,
      });
    }
  }

  /**
   * Get complete details of a single resource by its id.
   * Non-approved resources are only visible to the author.
   */
  async getResourceById(
    id: string,
    requestingUserId?: string,
    _userRole?: string,
    _clerkUserId?: string,
  ): Promise<RoadmapResource> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource id is required");
    }

    try {
      const resource =
        await this.roadmapResourceRepository.getResourceById(id);
      if (!resource || resource.status === "archived") {
        throw AppError.notFound(`Resource '${id}' not found`);
      }

      if (resource.status !== "approved") {
        const isAuthor = Boolean(
          requestingUserId && resource.submittedBy?.userId === requestingUserId,
        );

        if (!isAuthor) {
          throw AppError.notFound(`Resource '${id}' not found`);
        }
      }

      return await this.hydrateAuthor(resource);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id }, "Failed to fetch resource details");
      throw new AppError("Failed to fetch resource details", {
        statusCode: 500,
      });
    }
  }

  /**
   * Explore / search approved resources across all roadmaps with pagination
   */
  async getAllResources(
    options?: GetAllResourcesOptions,
  ): Promise<PaginatedResourcesResult> {
    try {
      const page = Math.max(1, Number(options?.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(options?.limit) || 20));
      const skip = (page - 1) * limit;

      const filter: GetRoadmapResourcesFilter = {
        roadmapSlug: options?.roadmapSlug,
        type: options?.type,
        search: options?.search,
        skip,
        limit,
        sort: options?.sort,
      };

      const { resources, total } =
        await this.roadmapResourceRepository.getAllResources(filter);

      return {
        resources: await this.hydrateAuthors(resources),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, options },
        "Failed to search resources catalog",
      );
      throw new AppError("Failed to search resources catalog", {
        statusCode: 500,
      });
    }
  }

  /**
   * Get resources submitted by a specific user (by username).
   * If the requester is the author (owner), all resource statuses (or optional status filter) are returned.
   * If the requester is an external visitor, only "approved" resources are returned.
   */
  async getUserResources(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserResourcesOptions,
  ): Promise<UserResourcesResult> {
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
      const { resources, total } =
        await this.roadmapResourceRepository.getUserResources(
          userIds,
          effectiveStatus,
          { page, limit },
        );

      return {
        resources: await this.hydrateAuthors(resources),
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
        "Failed to fetch user resources",
      );
      throw new AppError("Failed to fetch user resources", {
        statusCode: 500,
      });
    }
  }

  /**
   * Create a new community resource (always pending until approved)
   */
  async createResource(
    input: CreateResourceServiceInput,
  ): Promise<RoadmapResource> {
    if (!input.title || !input.title.trim()) {
      throw AppError.badRequest("Resource title is required");
    }

    if (!input.url || !input.url.trim()) {
      throw AppError.badRequest("Resource url is required");
    }

    if (!input.type || !input.type.trim()) {
      throw AppError.badRequest("Resource type is required");
    }

    if (!input.userId) {
      throw AppError.unauthorized(
        "User identity is required to create a resource",
      );
    }

    if (!input.roadmapIds || input.roadmapIds.length === 0) {
      throw AppError.badRequest("At least one roadmap category is required");
    }

    try {
      const thumbnailUrl =
        input.thumbnailUrl && input.thumbnailUrl.trim().length > 0
          ? input.thumbnailUrl.trim()
          : null;

      let submitter = {
        userId: input.userId,
        username: null as string | null,
        fullName: null as string | null,
        avatarUrl: null as string | null,
        submittedAt: new Date(),
      };
      try {
        let user = await this.userRepository.findById(input.userId);
        if (!user && input.userId.startsWith("user_")) {
          user = await this.userRepository.findByClerkId(input.userId);
        }
        if (user) {
          submitter = {
            userId: user.id,
            username: user.username || null,
            fullName: user.fullName || null,
            avatarUrl: user.avatarUrl || null,
            submittedAt: submitter.submittedAt,
          };
        }
      } catch (userErr) {
        logger.warn(
          { err: userErr, userId: input.userId },
          "Failed to attach submitter profile on resource create",
        );
      }

      const newResource: Partial<RoadmapResource> = {
        title: input.title.trim(),
        description: input.description?.trim() || "",
        url: input.url.trim(),
        thumbnailUrl,
        type: input.type.trim(),
        author: input.author?.trim() || "",
        roadmapIds: input.roadmapIds.map((id) => id.toLowerCase().trim()),
        order: 0,
        origin: "community",
        status: "pending",
        submittedBy: submitter,
        stats: {
          upvotesCount: 0,
          viewsCount: 0,
        },
      };

      const created =
        await this.roadmapResourceRepository.createResource(newResource);
      return await this.hydrateAuthor(created);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(
        { err: error, title: input.title },
        "Failed to create resource",
      );
      throw new AppError("Failed to create resource", {
        statusCode: 500,
      });
    }
  }

  /**
   * Update an existing community resource
   */
  async updateResource(
    id: string,
    input: UpdateResourceServiceInput,
    userId: string,
  ): Promise<RoadmapResource> {
    const existing = await this.roadmapResourceRepository.getResourceById(id);
    if (!existing) {
      throw AppError.notFound(`Resource '${id}' not found`);
    }

    if (
      existing.submittedBy?.userId &&
      existing.submittedBy.userId !== userId
    ) {
      throw AppError.forbidden(
        "You do not have permission to update this resource",
      );
    }

    if (!existing.submittedBy?.userId) {
      throw AppError.forbidden("Official resources cannot be updated");
    }

    try {
      const updates: Partial<RoadmapResource> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.description !== undefined)
        updates.description = input.description.trim();
      if (input.url !== undefined) updates.url = input.url.trim();
      if (input.type !== undefined) updates.type = input.type.trim();
      if (input.author !== undefined) updates.author = input.author.trim();
      if (input.roadmapIds !== undefined) {
        updates.roadmapIds = input.roadmapIds.map((rid) =>
          rid.toLowerCase().trim(),
        );
      }
      if (input.thumbnailUrl !== undefined) {
        updates.thumbnailUrl =
          input.thumbnailUrl && input.thumbnailUrl.trim().length > 0
            ? input.thumbnailUrl.trim()
            : null;
      }

      // Edited community resources go back to pending awaiting review
      updates.status = "pending";

      if (existing.submittedBy) {
        updates.submittedBy = {
          ...existing.submittedBy,
          userId,
        };
      }

      const updated = await this.roadmapResourceRepository.updateResource(
        id,
        updates,
      );
      if (!updated) {
        throw AppError.notFound(`Failed to update resource '${id}'`);
      }
      return await this.hydrateAuthor(updated);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id }, "Failed to update resource");
      throw new AppError("Failed to update resource", {
        statusCode: 500,
      });
    }
  }

  /**
   * Delete an existing community resource (only author can delete)
   */
  async deleteResource(id: string, userId: string): Promise<boolean> {
    if (!id || !id.trim()) {
      throw AppError.badRequest("Resource id is required");
    }

    const existing = await this.roadmapResourceRepository.getResourceById(id);
    if (!existing) {
      throw AppError.notFound(`Resource '${id}' not found`);
    }

    if (!existing.submittedBy?.userId) {
      throw AppError.forbidden("Official resources cannot be deleted");
    }

    if (existing.submittedBy.userId !== userId) {
      throw AppError.forbidden(
        "You do not have permission to delete this resource",
      );
    }

    try {
      const deleted = await this.roadmapResourceRepository.deleteResource(id);
      if (!deleted) {
        throw AppError.notFound(`Failed to delete resource '${id}'`);
      }
      logger.info({ id, userId }, "Successfully deleted community resource");
      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, id }, "Failed to delete resource");
      throw new AppError("Failed to delete resource", {
        statusCode: 500,
      });
    }
  }

  /**
   * Helper to hydrate community resource author details from the user repository.
   * Supports both PostgreSQL UUID and Clerk ID fallbacks.
   */
  private async hydrateAuthor(
    resource: RoadmapResource,
  ): Promise<RoadmapResource> {
    const [hydrated] = await this.hydrateAuthors([resource]);
    return hydrated;
  }

  private async hydrateAuthors(
    resources: RoadmapResource[],
  ): Promise<RoadmapResource[]> {
    const uniqueIds = [
      ...new Set(
        resources
          .map((resource) => resource.submittedBy?.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

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
            "Failed to hydrate resource author details from user repository",
          );
          return [id, null] as const;
        }
      }),
    );

    const usersById = new Map(
      userEntries.filter((entry) => entry[1] != null),
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
