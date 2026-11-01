import { apiClient } from "@/lib/api-client";
import type {
  RoadmapResource,
  AdminResourceStats,
  AdminResourceFilter,
  PaginatedAdminResourcesResult,
  CreateAdminResourcePayload,
  UpdateAdminResourcePayload,
  ModerateResourcePayload,
} from "@/types/roadmap-resource";

export * from "@/types/roadmap-resource";

export const roadmapResourceAdminService = {
  // ==========================================
  // 1. STATS
  // ==========================================

  getStats: async (): Promise<AdminResourceStats> => {
    const { data } = await apiClient.get("/admin/resources/items/stats");
    return (
      data.data ||
      data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        archived: 0,
        community: 0,
        official: 0,
      }
    );
  },

  // ==========================================
  // 2. LIST & GET
  // ==========================================

  getAllResources: async (
    filter?: AdminResourceFilter
  ): Promise<PaginatedAdminResourcesResult> => {
    const { data } = await apiClient.get("/admin/resources/items", {
      params: filter,
    });
    return (
      data.data ||
      data || {
        resources: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      }
    );
  },

  getResourceById: async (id: string): Promise<RoadmapResource> => {
    const { data } = await apiClient.get(
      `/admin/resources/items/${encodeURIComponent(id)}`
    );
    return data.data || data;
  },

  // ==========================================
  // 3. CREATE & UPDATE (Author Preserved)
  // ==========================================

  createResource: async (
    payload: CreateAdminResourcePayload
  ): Promise<RoadmapResource> => {
    const { data } = await apiClient.post(
      "/admin/resources/items",
      payload
    );
    return data.data || data;
  },

  updateResource: async (
    id: string,
    payload: UpdateAdminResourcePayload
  ): Promise<RoadmapResource> => {
    const { data } = await apiClient.put(
      `/admin/resources/items/${encodeURIComponent(id)}`,
      payload
    );
    return data.data || data;
  },

  // ==========================================
  // 4. MODERATION & DELETION
  // ==========================================

  moderateResource: async (
    id: string,
    payload: ModerateResourcePayload
  ): Promise<RoadmapResource> => {
    const { data } = await apiClient.patch(
      `/admin/resources/items/${encodeURIComponent(id)}/moderate`,
      payload
    );
    return data.data || data;
  },

  deleteResource: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(
      `/admin/resources/items/${encodeURIComponent(id)}`
    );
    return data.data || data;
  },
};

