import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  roadmapResourceAdminService,
  type RoadmapResource,
  type AdminResourceStats,
  type AdminResourceFilter,
  type CreateAdminResourcePayload,
  type UpdateAdminResourcePayload,
  type ModerateResourcePayload,
} from "@/services/roadmap-resource.service";
import { toast } from "sonner";

// ==========================================
// 1. STATS HOOK
// ==========================================

export const useAdminResourceStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-roadmap-resource-stats"],
    queryFn: async () => {
      return await roadmapResourceAdminService.getStats();
    },
  });

  return {
    stats: (statsQuery.data || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
      community: 0,
      official: 0,
    }) as AdminResourceStats,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

// ==========================================
// 2. RESOURCE LIST & PAGINATION HOOK
// ==========================================

export const useAdminResources = (filter?: AdminResourceFilter) => {
  const query = useQuery({
    queryKey: ["admin-roadmap-resources", filter],
    queryFn: () => roadmapResourceAdminService.getAllResources(filter),
  });

  return {
    resources: (query.data?.resources || []) as RoadmapResource[],
    pagination: {
      total: query.data?.total || 0,
      page: query.data?.page || 1,
      limit: query.data?.limit || 20,
      totalPages: query.data?.totalPages || 1,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ==========================================
// 3. SINGLE RESOURCE DETAIL HOOK
// ==========================================

export const useAdminResourceDetail = (id?: string) => {
  const query = useQuery({
    queryKey: ["admin-roadmap-resource", id],
    queryFn: () => roadmapResourceAdminService.getResourceById(id!),
    enabled: Boolean(id),
  });

  return {
    resource: query.data as RoadmapResource | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ==========================================
// 4. RESOURCE MUTATIONS HOOK
// ==========================================

export const useAdminResourceMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminResourcePayload) =>
      roadmapResourceAdminService.createResource(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-resources"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource-stats"],
      });
      toast.success(`Resource '${data.title}' created successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create resource"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAdminResourcePayload;
    }) => roadmapResourceAdminService.updateResource(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-resources"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource-stats"],
      });
      toast.success(`Resource '${data.title || "item"}' updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update resource"
      );
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ModerateResourcePayload;
    }) => roadmapResourceAdminService.moderateResource(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-resources"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource-stats"],
      });
      toast.success(
        `Resource status updated to '${variables.payload.status}' successfully!`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to moderate resource"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roadmapResourceAdminService.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-resources"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-resource-stats"],
      });
      toast.success("Resource deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete resource"
      );
    },
  });

  return {
    createResource: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateResource: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    moderateResource: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,

    deleteResource: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

