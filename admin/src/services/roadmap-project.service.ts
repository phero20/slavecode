import { apiClient } from "@/lib/api-client";
import type {
  RoadmapProject,
  AdminProjectStats,
  AdminProjectFilter,
  PaginatedAdminProjectsResult,
  CreateAdminProjectPayload,
  UpdateAdminProjectPayload,
  ModerateProjectPayload,
} from "@/types/roadmap-project";

export * from "@/types/roadmap-project";

export const roadmapProjectAdminService = {
  // ==========================================
  // 1. STATS
  // ==========================================

  getStats: async (): Promise<AdminProjectStats> => {
    const { data } = await apiClient.get("/admin/resources/projects/stats");
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
  // 2. LIST & DETAIL
  // ==========================================

  getAllProjects: async (
    filter?: AdminProjectFilter
  ): Promise<PaginatedAdminProjectsResult> => {
    const { data } = await apiClient.get("/admin/resources/projects", {
      params: filter,
    });
    return (
      data.data ||
      data || {
        projects: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      }
    );
  },

  getProjectBySlugOrId: async (slugOrId: string): Promise<RoadmapProject> => {
    const { data } = await apiClient.get(
      `/admin/resources/projects/${encodeURIComponent(slugOrId)}`
    );
    return data.data || data;
  },

  // ==========================================
  // 3. CREATE & UPDATE (Author Preserved)
  // ==========================================

  createProject: async (
    payload: CreateAdminProjectPayload
  ): Promise<RoadmapProject> => {
    const { data } = await apiClient.post(
      "/admin/resources/projects",
      payload
    );
    return data.data || data;
  },

  updateProject: async (
    slugOrId: string,
    payload: UpdateAdminProjectPayload
  ): Promise<RoadmapProject> => {
    const { data } = await apiClient.put(
      `/admin/resources/projects/${encodeURIComponent(slugOrId)}`,
      payload
    );
    return data.data || data;
  },

  // ==========================================
  // 4. MODERATION & DELETION
  // ==========================================

  moderateProject: async (
    slugOrId: string,
    payload: ModerateProjectPayload
  ): Promise<RoadmapProject> => {
    const { data } = await apiClient.patch(
      `/admin/resources/projects/${encodeURIComponent(slugOrId)}/moderate`,
      payload
    );
    return data.data || data;
  },

  deleteProject: async (slugOrId: string): Promise<void> => {
    const { data } = await apiClient.delete(
      `/admin/resources/projects/${encodeURIComponent(slugOrId)}`
    );
    return data.data || data;
  },
};

