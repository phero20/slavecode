import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  RoadmapSummary,
  RoadmapDetail,
  RoadmapCategory,
  GetRoadmapsParams,
  RoadmapTopic,
} from "@/types/resource";

/**
 * Fetch all roadmap categories and taxonomy dynamically from the API.
 */
export async function getCategories(): Promise<RoadmapCategory[]> {
  const response = await apiClient.get<ApiResponse<RoadmapCategory[]>>(
    "/resources/categories"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch categories");
  }

  return response.data.data;
}


/**
 * Fetch all roadmap summaries with optional category and search query filters.
 */
export async function getRoadmaps(
  params?: GetRoadmapsParams
): Promise<RoadmapSummary[]> {
  const queryParams: Record<string, string> = {};
  if (params?.category && params.category !== "all") {
    queryParams.category = params.category;
  }
  if (params?.query && params.query.trim().length > 0) {
    queryParams.query = params.query.trim();
  }

  const response = await apiClient.get<ApiResponse<RoadmapSummary[]>>(
    "/resources/roadmaps",
    { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch roadmaps");
  }

  return response.data.data;
}

/**
 * Fetch full interactive roadmap details and graph by slug.
 */
export async function getRoadmapBySlug(slug: string): Promise<RoadmapDetail> {
  const response = await apiClient.get<ApiResponse<RoadmapDetail>>(
    `/resources/roadmaps/${slug}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || `Failed to fetch roadmap details for ${slug}`
    );
  }

  return response.data.data;
}

/**
 * Fetch topic guide content, markdown description, and curated resources by node ID.
 */
export async function getRoadmapTopic(
  roadmapSlug: string,
  nodeId: string
): Promise<RoadmapTopic> {
  const response = await apiClient.get<ApiResponse<RoadmapTopic>>(
    `/resources/roadmaps/${encodeURIComponent(roadmapSlug)}/topics/${encodeURIComponent(nodeId)}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || `Failed to fetch topic details for node ${nodeId}`
    );
  }

  return response.data.data;
}

/**
 * Fetch all topic summaries for a roadmap.
 */
export async function getRoadmapTopics(
  roadmapSlug: string
): Promise<Partial<RoadmapTopic>[]> {
  const response = await apiClient.get<ApiResponse<Partial<RoadmapTopic>[]>>(
    `/resources/roadmaps/${encodeURIComponent(roadmapSlug)}/topics`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || `Failed to fetch topics for roadmap ${roadmapSlug}`
    );
  }

  return response.data.data;
}


