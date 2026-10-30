"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getRoadmapResources,
  getResourceById,
  getResources,
  getUserResources,
} from "@/services/queries/roadmap-resource.queries";
import type {
  RoadmapResourceItem,
  GetResourcesParams,
  PaginatedResourcesResponse,
  UserResourcesResponse,
  ResourceSortOption,
} from "@/types/roadmap-resource";

/**
 * Hook to fetch approved resources for a specific roadmap.
 */
export function useRoadmapResourcesQuery(
  roadmapSlug: string | undefined,
  type?: string | "all",
  sort?: ResourceSortOption
) {
  return useQuery<RoadmapResourceItem[], Error>({
    queryKey: [
      "resources-roadmap-resources",
      roadmapSlug,
      type || "all",
      sort || "default",
    ],
    queryFn: () => getRoadmapResources(roadmapSlug!, type, sort),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!roadmapSlug,
  });
}

/**
 * Hook to fetch a single resource by id.
 */
export function useResourceDetailQuery(
  resourceId: string | undefined,
  options?: { initialData?: RoadmapResourceItem }
) {
  return useQuery<RoadmapResourceItem, Error>({
    queryKey: ["resources-resource-detail", resourceId],
    queryFn: () => getResourceById(resourceId!),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!resourceId,
    ...options,
  });
}

/**
 * Hook to explore and search approved resources across all roadmaps.
 */
export function useResourcesQuery(params?: GetResourcesParams) {
  return useQuery<PaginatedResourcesResponse, Error>({
    queryKey: ["resources-resources-catalog", params],
    queryFn: () => getResources(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to explore resources with auto-scroll infinite pagination.
 */
export function useInfiniteResourcesQuery(
  params?: GetResourcesParams,
  initialData?: PaginatedResourcesResponse
) {
  const limit = params?.limit ?? 18;
  const hasFilters =
    (!!params?.roadmap && params.roadmap !== "all") ||
    (!!params?.type && params.type !== "all") ||
    !!params?.search ||
    (!!params?.sort && params.sort !== "default");

  const effectiveInitialData = hasFilters ? undefined : initialData;

  return useInfiniteQuery<PaginatedResourcesResponse, Error>({
    queryKey: ["resources-resources-catalog-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getResources({ ...params, page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.resources && lastPage.resources.length < limit) {
        return undefined;
      }
      if (
        lastPage?.page &&
        lastPage.totalPages &&
        lastPage.page >= lastPage.totalPages
      ) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialData: effectiveInitialData
      ? { pages: [effectiveInitialData], pageParams: [1] }
      : undefined,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to fetch resources created by a user with status & pagination filters.
 */
export function useUserResourcesQuery(
  username: string | undefined,
  params?: { status?: string; page?: number; limit?: number }
) {
  return useQuery<UserResourcesResponse, Error>({
    queryKey: ["user-resources", username, params],
    queryFn: () => getUserResources(username!, params),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
