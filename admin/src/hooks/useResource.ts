import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  resourceAdminService,
  type RoadmapCategory,
  type Roadmap,
  type ResourceAdminStats,
  type CreateRoadmapCategoryPayload,
  type UpdateRoadmapCategoryPayload,
  type CreateRoadmapPayload,
  type UpdateRoadmapPayload,
  type RoadmapAdminListFilter,
} from "@/services/resource.service";
import { toast } from "sonner";

// ==========================================
// 1. STATS HOOK
// ==========================================

export const useResourceAdminStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-resource-stats"],
    queryFn: async () => {
      return await resourceAdminService.getStats();
    },
  });

  return {
    stats: (statsQuery.data || {
      roadmaps: { total: 0, published: 0, draft: 0, archived: 0 },
      categories: 0,
      totalNodes: 0,
    }) as ResourceAdminStats,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

// ==========================================
// 2. ROADMAP CATEGORIES HOOK
// ==========================================

export const useRoadmapCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-roadmap-categories"],
    queryFn: () => resourceAdminService.getAllCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRoadmapCategoryPayload) =>
      resourceAdminService.createCategory(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      toast.success(`Category '${data.title}' created successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create category"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRoadmapCategoryPayload;
    }) => resourceAdminService.updateCategory(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      toast.success(`Category '${data.title}' updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update category"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourceAdminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      toast.success("Category deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete category"
      );
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

// ==========================================
// 3. DEVELOPER ROADMAPS HOOK
// ==========================================

export const useDeveloperRoadmaps = (filter?: RoadmapAdminListFilter) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-roadmaps", filter],
    queryFn: () => resourceAdminService.getAllRoadmaps(filter),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRoadmapPayload) =>
      resourceAdminService.createRoadmap(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      toast.success(`Roadmap '${data.title?.card || data.slug}' created!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create roadmap"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: UpdateRoadmapPayload;
    }) => resourceAdminService.updateRoadmap(slug, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-detail", data.slug],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      toast.success(`Roadmap '${data.title?.card || data.slug}' updated!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update roadmap"
      );
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      slug,
      status,
    }: {
      slug: string;
      status: "published" | "draft" | "archived";
    }) => resourceAdminService.updateRoadmapStatus(slug, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-detail", data.slug],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      toast.success(`Roadmap status updated to '${data.status}'!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update roadmap status"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => resourceAdminService.deleteRoadmap(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      toast.success("Roadmap deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete roadmap"
      );
    },
  });

  const syncCategoriesMutation = useMutation({
    mutationFn: () => resourceAdminService.syncCategoryCounts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resource-stats"] });
      toast.success("Category counts synchronized!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to sync category counts"
      );
    },
  });

  return {
    roadmaps: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    createRoadmap: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateRoadmap: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    updateRoadmapStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    deleteRoadmap: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    syncCategoryCounts: syncCategoriesMutation.mutateAsync,
    isSyncing: syncCategoriesMutation.isPending,
  };
};

// ==========================================
// 4. ROADMAP DETAIL HOOK
// ==========================================

export const useRoadmapDetail = (slug?: string) => {
  const query = useQuery({
    queryKey: ["admin-roadmap-detail", slug],
    queryFn: () => {
      if (!slug) return null;
      return resourceAdminService.getRoadmapBySlug(slug);
    },
    enabled: Boolean(slug),
  });

  return {
    roadmap: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export * from "./useRoadmapResource";
export * from "./useRoadmapProject";



