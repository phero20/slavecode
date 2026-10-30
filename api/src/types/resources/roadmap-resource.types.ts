import type {
  RoadmapResource,
  ResourceStatus,
  IResourceReview,
} from "../../mongo/models/roadmap-resource.model";

export type ResourceSortOption = "default" | "newest";

export interface GetRoadmapResourcesFilter {
  roadmapSlug?: string;
  type?: string;
  search?: string;
  status?: ResourceStatus | "all";
  limit?: number;
  skip?: number;
  sort?: ResourceSortOption;
}

export interface GetAllResourcesOptions {
  roadmapSlug?: string;
  type?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  sort?: ResourceSortOption;
}

export interface PaginatedResourcesResult {
  resources: RoadmapResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserResourcesResult {
  resources: RoadmapResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isOwner: boolean;
}

export interface GetUserResourcesOptions {
  status?: string;
  page?: number | string;
  limit?: number | string;
}

export interface CreateResourceServiceInput {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  author?: string;
  roadmapIds: string[];
  userId: string;
}

export interface UpdateResourceServiceInput {
  title?: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string | null;
  type?: string;
  author?: string;
  roadmapIds?: string[];
}

export interface IRoadmapResourceService {
  getResourcesByRoadmap(
    roadmapSlug: string,
    type?: string,
    sort?: ResourceSortOption,
  ): Promise<RoadmapResource[]>;
  getResourceById(
    id: string,
    requestingUserId?: string,
    userRole?: string,
    clerkUserId?: string,
  ): Promise<RoadmapResource>;
  getAllResources(
    options?: GetAllResourcesOptions,
  ): Promise<PaginatedResourcesResult>;
  getUserResources(
    username: string,
    requestingUserId?: string,
    clerkUserId?: string,
    options?: GetUserResourcesOptions,
  ): Promise<UserResourcesResult>;
  createResource(input: CreateResourceServiceInput): Promise<RoadmapResource>;
  updateResource(
    id: string,
    input: UpdateResourceServiceInput,
    userId: string,
  ): Promise<RoadmapResource>;
  deleteResource(id: string, userId: string): Promise<boolean>;
}

export interface IRoadmapResourceRepository {
  getResourcesByRoadmap(
    roadmapSlug: string,
    type?: string,
    sort?: ResourceSortOption,
  ): Promise<RoadmapResource[]>;

  getAllResources(filter?: GetRoadmapResourcesFilter): Promise<{
    resources: RoadmapResource[];
    total: number;
  }>;

  getResourceById(id: string): Promise<RoadmapResource | null>;

  createResource(data: Partial<RoadmapResource>): Promise<RoadmapResource>;

  updateResource(
    id: string,
    data: Partial<RoadmapResource>,
  ): Promise<RoadmapResource | null>;

  deleteResource(id: string): Promise<boolean>;

  getUserResources(
    userIds: string[],
    statusFilter?: string,
    pagination?: { page?: number; limit?: number },
  ): Promise<{ resources: RoadmapResource[]; total: number }>;

  getPendingResources(pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ resources: RoadmapResource[]; total: number }>;

  updateStatus(
    id: string,
    status: ResourceStatus,
    reviewData?: IResourceReview,
  ): Promise<RoadmapResource | null>;

  incrementUpvote(id: string, delta?: number): Promise<RoadmapResource | null>;
}

