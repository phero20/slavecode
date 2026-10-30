import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  RoadmapResourceItem,
  GetResourcesParams,
  PaginatedResourcesResponse,
  UserResourcesResponse,
  ResourceSortOption,
} from "@/types/roadmap-resource";

/**
 * Fetch approved resources associated with a given roadmap.
 */
export async function getRoadmapResources(
  roadmapSlug: string,
  type?: string | "all",
  sort?: ResourceSortOption
): Promise<RoadmapResourceItem[]> {
  const queryParams: Record<string, string> = {};
  if (type && type !== "all") {
    queryParams.type = type;
  }
  if (sort) {
    queryParams.sort = sort;
  }

  const response = await apiClient.get<ApiResponse<RoadmapResourceItem[]>>(
    `/resources/roadmaps/${encodeURIComponent(roadmapSlug)}/resources`,
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ||
        `Failed to fetch resources for roadmap '${roadmapSlug}'`
    );
  }

  return response.data.data;
}

/**
 * Fetch a single resource by its id.
 */
export async function getResourceById(
  resourceId: string
): Promise<RoadmapResourceItem> {
  const response = await apiClient.get<ApiResponse<RoadmapResourceItem>>(
    `/resources/resources/${encodeURIComponent(resourceId)}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ||
        `Failed to fetch resource details for '${resourceId}'`
    );
  }

  return response.data.data;
}

/**
 * Explore / search approved resources across all roadmaps with pagination.
 */
export async function getResources(
  params?: GetResourcesParams
): Promise<PaginatedResourcesResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.roadmap) queryParams.roadmap = params.roadmap;
  if (params?.type && params.type !== "all") {
    queryParams.type = params.type;
  }
  if (params?.search && params.search.trim().length > 0) {
    queryParams.search = params.search.trim();
  }
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sort) queryParams.sort = params.sort;

  const response = await apiClient.get<ApiResponse<PaginatedResourcesResponse>>(
    "/resources/resources",
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to search resources");
  }

  return response.data.data;
}

/**
 * Fetch resources submitted by a specific user.
 */
export async function getUserResources(
  username: string,
  params?: { status?: string; page?: number; limit?: number }
): Promise<UserResourcesResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const response = await apiClient.get<ApiResponse<UserResourcesResponse>>(
    `/resources/resources/user/${encodeURIComponent(username)}`,
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ||
        `Failed to fetch resources for user '${username}'`
    );
  }

  return response.data.data;
}
