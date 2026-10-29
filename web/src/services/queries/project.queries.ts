import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  RoadmapProjectItem,
  ProjectDifficulty,
  GetProjectsParams,
  PaginatedProjectsResponse,
  ProjectCategory,
  UserProjectsResponse,
  ProjectSortOption,
} from "@/types/project";

/**
 * Fetch approved hands-on projects associated with a given roadmap.
 */
export async function getRoadmapProjects(
  roadmapSlug: string,
  difficulty?: ProjectDifficulty | "all",
  sort?: ProjectSortOption
): Promise<RoadmapProjectItem[]> {
  const queryParams: Record<string, string> = {};
  if (difficulty && difficulty !== "all") {
    queryParams.difficulty = difficulty;
  }
  if (sort) {
    queryParams.sort = sort;
  }

  const response = await apiClient.get<ApiResponse<RoadmapProjectItem[]>>(
    `/resources/roadmaps/${encodeURIComponent(roadmapSlug)}/projects`,
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ||
        `Failed to fetch projects for roadmap '${roadmapSlug}'`
    );
  }

  return response.data.data;
}

/**
 * Fetch a single project by its unique slug (with complete requirements and checklist).
 */
export async function getProjectBySlug(
  projectSlug: string
): Promise<RoadmapProjectItem> {
  const response = await apiClient.get<ApiResponse<RoadmapProjectItem>>(
    `/resources/projects/${encodeURIComponent(projectSlug)}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ||
        `Failed to fetch project details for '${projectSlug}'`
    );
  }

  return response.data.data;
}

/**
 * Explore / search projects across all roadmaps with pagination.
 */
export async function getProjects(
  params?: GetProjectsParams
): Promise<PaginatedProjectsResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.roadmap) queryParams.roadmap = params.roadmap;
  if (params?.difficulty && params.difficulty !== "all") {
    queryParams.difficulty = params.difficulty;
  }
  if (params?.search && params.search.trim().length > 0) {
    queryParams.search = params.search.trim();
  }
  if (params?.topic) queryParams.topic = params.topic.trim();
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sort) queryParams.sort = params.sort;

  const response = await apiClient.get<ApiResponse<PaginatedProjectsResponse>>(
    "/resources/projects",
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to search projects");
  }

  return response.data.data;
}

/**
 * Fetch top popular projects by engagement.
 */
export async function getPopularProjects(
  limit = 10
): Promise<RoadmapProjectItem[]> {
  const response = await apiClient.get<ApiResponse<RoadmapProjectItem[]>>(
    "/resources/projects/popular",
    { params: { limit } }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch popular projects");
  }

  return response.data.data;
}

/**
 * Fetch dynamic project categories with live counts from all approved roadmap projects.
 */
export async function getProjectCategories(): Promise<ProjectCategory[]> {
  const response = await apiClient.get<ApiResponse<ProjectCategory[]>>(
    "/resources/projects/categories"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Failed to fetch project categories"
    );
  }

  return response.data.data;
}

/**
 * Fetch projects submitted by a specific user (for profile tabs and author portfolios).
 */
export async function getUserProjects(
  username: string,
  params?: { status?: string; page?: number; limit?: number }
): Promise<UserProjectsResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const response = await apiClient.get<ApiResponse<UserProjectsResponse>>(
    `/resources/projects/user/${encodeURIComponent(username)}`,
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || `Failed to fetch projects for user '${username}'`
    );
  }

  return response.data.data;
}
