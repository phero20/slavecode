"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/services/mutations/project.mutations";
import type { CreateProjectPayload, RoadmapProjectItem } from "@/types/project";
import { toast } from "sonner";

/**
 * Hook to create a new project.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<RoadmapProjectItem, Error, CreateProjectPayload>({
    mutationFn: (data: CreateProjectPayload) => createProject(data),
    onSuccess: (newProject) => {
      // Invalidate user projects list
      queryClient.invalidateQueries({
        queryKey: ["user-projects"],
      });

      // Prime project detail cache for instant preview
      if (newProject?.slug) {
        queryClient.setQueryData(
          ["resources-project-detail", newProject.slug],
          newProject
        );
      }

      toast.success("Project submitted for review!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

/**
 * Hook to update an existing project.
 */
export function useUpdateProject(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<
    RoadmapProjectItem,
    Error,
    Partial<CreateProjectPayload>
  >({
    mutationFn: (data: Partial<CreateProjectPayload>) =>
      updateProject(slug, data),
    onSuccess: (updatedProject) => {
      // Invalidate user projects, catalogs, roadmap projects, and update detail cache
      queryClient.invalidateQueries({
        queryKey: ["user-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-catalog-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-catalog"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-popular"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-roadmap-projects"],
      });

      if (updatedProject?.slug) {
        queryClient.setQueryData(
          ["resources-project-detail", updatedProject.slug],
          updatedProject
        );
      }

      toast.success("Project updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

/**
 * Hook to delete an existing community project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (slug: string) => deleteProject(slug),
    onSuccess: (_, deletedSlug) => {
      // Remove detail cache & invalidate listings, user projects, and roadmap views
      queryClient.removeQueries({
        queryKey: ["resources-project-detail", deletedSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-catalog-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-catalog"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-projects-popular"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-roadmap-projects"],
      });

      toast.success("Project deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}

