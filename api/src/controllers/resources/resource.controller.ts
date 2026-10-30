import { BaseController } from "../base.controller";
import {
  type IResourceService,
  type IRoadmapProjectService,
  type IRoadmapResourceService,
} from "../../types/resources";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";
import {
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateResourceInput,
  type UpdateResourceInput,
} from "../../validators/resource.validator";

export class ResourceController extends BaseController {
  private readonly resourceService: IResourceService;
  private readonly roadmapProjectService: IRoadmapProjectService;
  private readonly roadmapResourceService: IRoadmapResourceService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.resourceService = cradle.resourceService;
    this.roadmapProjectService = cradle.roadmapProjectService;
    this.roadmapResourceService = cradle.roadmapResourceService;
  }

  async getRoadmaps(
    req: ControllerRequest<never, never, { category?: string; query?: string }>,
  ) {
    const data = await this.resourceService.getAllRoadmaps(req.query);
    return ApiResponse.success(data);
  }

  async getRoadmapBySlug(
    req: ControllerRequest<never, { slug: string }, never>,
  ) {
    const data = await this.resourceService.getRoadmapBySlug(req.params.slug);
    return ApiResponse.success(data);
  }

  async getCategories(_req: ControllerRequest) {
    const data = await this.resourceService.getCategories();
    return ApiResponse.success(data);
  }

  async getTopicByNodeId(
    req: ControllerRequest<never, { slug: string; nodeId: string }, never>,
  ) {
    const data = await this.resourceService.getTopicByNodeId(
      req.params.slug,
      req.params.nodeId,
    );
    return ApiResponse.success(data);
  }

  async getTopicsByRoadmap(
    req: ControllerRequest<never, { slug: string }, never>,
  ) {
    const data = await this.resourceService.getTopicsByRoadmap(req.params.slug);
    return ApiResponse.success(data);
  }

  async getProjectsByRoadmap(
    req: ControllerRequest<
      never,
      { slug: string },
      { difficulty?: string; sort?: "default" | "newest" }
    >,
  ) {
    const data = await this.roadmapProjectService.getProjectsByRoadmap(
      req.params.slug,
      req.query?.difficulty,
      req.query?.sort as any,
    );
    return ApiResponse.success(data);
  }

  async getProjectBySlug(
    req: ControllerRequest<never, { projectSlug: string }, never>,
  ) {
    const data = await this.roadmapProjectService.getProjectBySlug(
      req.params.projectSlug,
      req.user?.id,
      req.user?.role,
      req.clerkUserId,
    );
    return ApiResponse.success(data);
  }

  async getAllProjects(
    req: ControllerRequest<
      never,
      never,
      {
        roadmap?: string;
        difficulty?: string;
        search?: string;
        topic?: string;
        page?: string;
        limit?: string;
        sort?: "default" | "newest";
      }
    >,
  ) {
    const data = await this.roadmapProjectService.getAllProjects({
      roadmapSlug: req.query?.roadmap,
      difficulty: req.query?.difficulty,
      search: req.query?.search,
      topic: req.query?.topic,
      page: req.query?.page,
      limit: req.query?.limit,
      sort: req.query?.sort as any,
    });
    return ApiResponse.success(data);
  }

  async getPopularProjects(
    req: ControllerRequest<never, never, { limit?: string }>,
  ) {
    const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 10;
    const data = await this.roadmapProjectService.getPopularProjects(limit);
    return ApiResponse.success(data);
  }

  async getProjectCategories(_req: ControllerRequest) {
    const data = await this.roadmapProjectService.getProjectCategories();
    return ApiResponse.success(data);
  }

  async getUserProjects(
    req: ControllerRequest<
      never,
      { username: string },
      { status?: string; page?: string; limit?: string }
    >,
  ) {
    const data = await this.roadmapProjectService.getUserProjects(
      req.params.username,
      req.user?.id,
      req.clerkUserId,
      {
        status: req.query?.status,
        page: req.query?.page,
        limit: req.query?.limit,
      },
    );
    return ApiResponse.success(data);
  }

  async createProject(req: ControllerRequest<CreateProjectInput>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to create a project");
    }

    const data = await this.roadmapProjectService.createProject({
      ...req.body,
      userId,
    });

    return ApiResponse.success(data);
  }

  async updateProject(
    req: ControllerRequest<UpdateProjectInput, { projectSlug: string }>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to update a project");
    }

    const slug = req.params?.projectSlug;
    if (!slug) {
      throw AppError.badRequest("Project slug is required");
    }

    const data = await this.roadmapProjectService.updateProject(
      slug,
      req.body,
      userId,
    );

    return ApiResponse.success(data);
  }

  async deleteProject(
    req: ControllerRequest<never, { projectSlug: string }>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to delete a project");
    }

    const slug = req.params?.projectSlug;
    if (!slug) {
      throw AppError.badRequest("Project slug is required");
    }

    await this.roadmapProjectService.deleteProject(slug, userId);

    return ApiResponse.success({ message: "Project deleted successfully" });
  }

  async getResourcesByRoadmap(
    req: ControllerRequest<
      never,
      { slug: string },
      { type?: string; sort?: "default" | "newest" }
    >,
  ) {
    const data = await this.roadmapResourceService.getResourcesByRoadmap(
      req.params.slug,
      req.query?.type,
      req.query?.sort as any,
    );
    return ApiResponse.success(data);
  }

  async getResourceById(
    req: ControllerRequest<never, { resourceId: string }, never>,
  ) {
    const data = await this.roadmapResourceService.getResourceById(
      req.params.resourceId,
      req.user?.id,
      req.user?.role,
      req.clerkUserId,
    );
    return ApiResponse.success(data);
  }

  async getAllResources(
    req: ControllerRequest<
      never,
      never,
      {
        roadmap?: string;
        type?: string;
        search?: string;
        page?: string;
        limit?: string;
        sort?: "default" | "newest";
      }
    >,
  ) {
    const data = await this.roadmapResourceService.getAllResources({
      roadmapSlug: req.query?.roadmap,
      type: req.query?.type,
      search: req.query?.search,
      page: req.query?.page,
      limit: req.query?.limit,
      sort: req.query?.sort as any,
    });
    return ApiResponse.success(data);
  }

  async getUserResources(
    req: ControllerRequest<
      never,
      { username: string },
      { status?: string; page?: string; limit?: string }
    >,
  ) {
    const data = await this.roadmapResourceService.getUserResources(
      req.params.username,
      req.user?.id,
      req.clerkUserId,
      {
        status: req.query?.status,
        page: req.query?.page,
        limit: req.query?.limit,
      },
    );
    return ApiResponse.success(data);
  }

  async createResource(req: ControllerRequest<CreateResourceInput>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to create a resource");
    }

    const data = await this.roadmapResourceService.createResource({
      ...req.body,
      userId,
    });

    return ApiResponse.success(data);
  }

  async updateResource(
    req: ControllerRequest<UpdateResourceInput, { resourceId: string }>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to update a resource");
    }

    const id = req.params?.resourceId;
    if (!id) {
      throw AppError.badRequest("Resource id is required");
    }

    const data = await this.roadmapResourceService.updateResource(
      id,
      req.body,
      userId,
    );

    return ApiResponse.success(data);
  }

  async deleteResource(
    req: ControllerRequest<never, { resourceId: string }>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized("Authentication required to delete a resource");
    }

    const id = req.params?.resourceId;
    if (!id) {
      throw AppError.badRequest("Resource id is required");
    }

    await this.roadmapResourceService.deleteResource(id, userId);

    return ApiResponse.success({ message: "Resource deleted successfully" });
  }
}

