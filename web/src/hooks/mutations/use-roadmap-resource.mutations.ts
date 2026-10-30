"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createResource,
  updateResource,
  deleteResource,
} from "@/services/mutations/roadmap-resource.mutations";
import type {
  CreateRoadmapResourcePayload,
  RoadmapResourceItem,
} from "@/types/roadmap-resource";
import { toast } from "sonner";

/**
 * Hook to create a new community resource.
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation<RoadmapResourceItem, Error, CreateRoadmapResourcePayload>({
    mutationFn: (data: CreateRoadmapResourcePayload) => createResource(data),
    onSuccess: (newResource) => {
      queryClient.invalidateQueries({
        queryKey: ["user-resources"],
      });

      if (newResource?.id) {
        queryClient.setQueryData(
          ["resources-resource-detail", newResource.id],
          newResource
        );
      }

      toast.success("Resource submitted for review!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create resource");
    },
  });
}

/**
 * Hook to update an existing community resource.
 */
export function useUpdateResource(resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    RoadmapResourceItem,
    Error,
    Partial<CreateRoadmapResourcePayload>
  >({
    mutationFn: (data: Partial<CreateRoadmapResourcePayload>) =>
      updateResource(resourceId, data),
    onSuccess: (updatedResource) => {
      queryClient.invalidateQueries({
        queryKey: ["user-resources"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-resources-catalog-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-resources-catalog"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-roadmap-resources"],
      });

      if (updatedResource?.id) {
        queryClient.setQueryData(
          ["resources-resource-detail", updatedResource.id],
          updatedResource
        );
      }

      toast.success("Resource updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update resource");
    },
  });
}

/**
 * Hook to delete an existing community resource.
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (resourceId: string) => deleteResource(resourceId),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: ["resources-resource-detail", deletedId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-resources"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-resources-catalog-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-resources-catalog"],
      });
      queryClient.invalidateQueries({
        queryKey: ["resources-roadmap-resources"],
      });

      toast.success("Resource deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete resource");
    },
  });
}
