import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  RoadmapResourceItem,
  CreateRoadmapResourcePayload,
} from "@/types/roadmap-resource";

/**
 * Create a new community resource (saved as pending).
 */
export async function createResource(
  data: CreateRoadmapResourcePayload
): Promise<RoadmapResourceItem> {
  const response = await apiClient.post<ApiResponse<RoadmapResourceItem>>(
    "/resources/resources",
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create resource");
  }

  return response.data.data;
}

/**
 * Update an existing community resource.
 */
export async function updateResource(
  resourceId: string,
  data: Partial<CreateRoadmapResourcePayload>
): Promise<RoadmapResourceItem> {
  const response = await apiClient.put<ApiResponse<RoadmapResourceItem>>(
    `/resources/resources/${resourceId}`,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to update resource");
  }

  return response.data.data;
}

/**
 * Delete an existing community resource.
 */
export async function deleteResource(resourceId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/resources/resources/${resourceId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete resource");
  }
}
