import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  roadmapProjectAdminService,
  type RoadmapProject,
  type AdminProjectStats,
  type AdminProjectFilter,
  type CreateAdminProjectPayload,
  type UpdateAdminProjectPayload,
  type ModerateProjectPayload,
} from "@/services/roadmap-project.service";
import { toast } from "sonner";

// ==========================================
// 1. STATS HOOK
// ==========================================

export const useAdminProjectStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-roadmap-project-stats"],
    queryFn: async () => {
      return await roadmapProjectAdminService.getStats();
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
    }) as AdminProjectStats,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

// ==========================================
// 2. PROJECT LIST & PAGINATION HOOK
// ==========================================

export const useAdminProjects = (filter?: AdminProjectFilter) => {
  const query = useQuery({
    queryKey: ["admin-roadmap-projects", filter],
    queryFn: () => roadmapProjectAdminService.getAllProjects(filter),
    placeholderData: keepPreviousData,
  });

  return {
    projects: (query.data?.projects || []) as RoadmapProject[],
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
// 3. SINGLE PROJECT DETAIL HOOK
// ==========================================

export const useAdminProjectDetail = (slugOrId?: string) => {
  const query = useQuery({
    queryKey: ["admin-roadmap-project", slugOrId],
    queryFn: () => roadmapProjectAdminService.getProjectBySlugOrId(slugOrId!),
    enabled: Boolean(slugOrId),
  });

  return {
    project: query.data as RoadmapProject | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ==========================================
// 4. PROJECT MUTATIONS HOOK
// ==========================================

export const useAdminProjectMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminProjectPayload) =>
      roadmapProjectAdminService.createProject(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project-stats"],
      });
      toast.success(`Project '${data.title}' created successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create project"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      slugOrId,
      payload,
    }: {
      slugOrId: string;
      payload: UpdateAdminProjectPayload;
    }) => roadmapProjectAdminService.updateProject(slugOrId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project", variables.slugOrId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project", data.slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project-stats"],
      });
      toast.success(`Project '${data.title || "item"}' updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update project"
      );
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      slugOrId,
      payload,
    }: {
      slugOrId: string;
      payload: ModerateProjectPayload;
    }) => roadmapProjectAdminService.moderateProject(slugOrId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project", variables.slugOrId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project", data.slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project-stats"],
      });
      toast.success(
        `Project status updated to '${variables.payload.status}' successfully!`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to moderate project"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slugOrId: string) =>
      roadmapProjectAdminService.deleteProject(slugOrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roadmap-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-roadmap-project-stats"],
      });
      toast.success("Project deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete project"
      );
    },
  });

  return {
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    moderateProject: moderateMutation.mutateAsync,
    isModerating: moderateMutation.isPending,

    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

