import { apiClient } from "@/lib/api-client";
import type {
  RoadmapCategory,
  Roadmap,
  ResourceAdminStats,
  CreateRoadmapCategoryPayload,
  UpdateRoadmapCategoryPayload,
  CreateRoadmapPayload,
  UpdateRoadmapPayload,
  RoadmapAdminListFilter,
} from "@/types/resource";

export * from "@/types/resource";

export const resourceAdminService = {
  // ==========================================
  // STATS
  // ==========================================

  getStats: async (): Promise<ResourceAdminStats> => {
    const { data } = await apiClient.get("/admin/resources/stats");
    return (
      data.data ||
      data || {
        roadmaps: { total: 0, published: 0, draft: 0, archived: 0 },
        categories: 0,
        totalNodes: 0,
      }
    );
  },

  // ==========================================
  // ROADMAP CATEGORIES
  // ==========================================

  getAllCategories: async (): Promise<RoadmapCategory[]> => {
    const { data } = await apiClient.get("/admin/resources/categories");
    return data.data || data || [];
  },

  getCategoryById: async (id: string): Promise<RoadmapCategory> => {
    const { data } = await apiClient.get(
      `/admin/resources/categories/${encodeURIComponent(id)}`
    );
    return data.data || data;
  },

  createCategory: async (
    payload: CreateRoadmapCategoryPayload
  ): Promise<RoadmapCategory> => {
    const { data } = await apiClient.post(
      "/admin/resources/categories",
      payload
    );
    return data.data || data;
  },

  updateCategory: async (
    id: string,
    payload: UpdateRoadmapCategoryPayload
  ): Promise<RoadmapCategory> => {
    const { data } = await apiClient.put(
      `/admin/resources/categories/${encodeURIComponent(id)}`,
      payload
    );
    return data.data || data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(
      `/admin/resources/categories/${encodeURIComponent(id)}`
    );
    return data.data || data;
  },

  // ==========================================
  // DEVELOPER ROADMAPS
  // ==========================================

  getAllRoadmaps: async (
    filter?: RoadmapAdminListFilter
  ): Promise<Roadmap[]> => {
    const { data } = await apiClient.get("/admin/resources/roadmaps", {
      params: filter,
    });
    return data.data || data || [];
  },

  getRoadmapBySlug: async (slug: string): Promise<Roadmap> => {
    const { data } = await apiClient.get(
      `/admin/resources/roadmaps/${encodeURIComponent(slug)}`
    );
    return data.data || data;
  },

  createRoadmap: async (
    payload: CreateRoadmapPayload
  ): Promise<Roadmap> => {
    const { data } = await apiClient.post(
      "/admin/resources/roadmaps",
      payload
    );
    return data.data || data;
  },

  updateRoadmap: async (
    slug: string,
    payload: UpdateRoadmapPayload
  ): Promise<Roadmap> => {
    const { data } = await apiClient.put(
      `/admin/resources/roadmaps/${encodeURIComponent(slug)}`,
      payload
    );
    return data.data || data;
  },

  updateRoadmapStatus: async (
    slug: string,
    status: "published" | "draft" | "archived"
  ): Promise<Roadmap> => {
    const { data } = await apiClient.patch(
      `/admin/resources/roadmaps/${encodeURIComponent(slug)}/status`,
      { status }
    );
    return data.data || data;
  },

  deleteRoadmap: async (slug: string): Promise<void> => {
    const { data } = await apiClient.delete(
      `/admin/resources/roadmaps/${encodeURIComponent(slug)}`
    );
    return data.data || data;
  },

  syncCategoryCounts: async (): Promise<void> => {
    const { data } = await apiClient.post(
      "/admin/resources/roadmaps/sync-categories"
    );
    return data.data || data;
  },
};

export { roadmapResourceAdminService } from "./roadmap-resource.service";
export { roadmapProjectAdminService } from "./roadmap-project.service";



