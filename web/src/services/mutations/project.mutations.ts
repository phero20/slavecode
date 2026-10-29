import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { RoadmapProjectItem, CreateProjectPayload } from "@/types/project";

/**
 * Create a new hands-on project.
 */
export async function createProject(
  data: CreateProjectPayload
): Promise<RoadmapProjectItem> {
  const response = await apiClient.post<ApiResponse<RoadmapProjectItem>>(
    "/resources/projects",
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create project");
  }

  return response.data.data;
}

/**
 * Update an existing hands-on project.
 */
export async function updateProject(
  slug: string,
  data: Partial<CreateProjectPayload>
): Promise<RoadmapProjectItem> {
  const response = await apiClient.put<ApiResponse<RoadmapProjectItem>>(
    `/resources/projects/${slug}`,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to update project");
  }

  return response.data.data;
}

/**
 * Delete an existing community project.
 */
export async function deleteProject(slug: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/resources/projects/${slug}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete project");
  }
}

