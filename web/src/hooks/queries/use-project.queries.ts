"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getRoadmapProjects,
  getProjectBySlug,
  getProjects,
  getPopularProjects,
  getProjectCategories,
  getUserProjects,
} from "@/services/queries/project.queries";
import type {
  RoadmapProjectItem,
  ProjectDifficulty,
  GetProjectsParams,
  PaginatedProjectsResponse,
  ProjectCategory,
  UserProjectsResponse,
  ProjectSortOption,
} from "@/types/project";

/**
 * Hook to fetch projects for a specific roadmap (e.g. 'frontend', 'backend')
 * with optional difficulty filter and sort option.
 */
export function useRoadmapProjectsQuery(
  roadmapSlug: string | undefined,
  difficulty?: ProjectDifficulty | "all",
  sort?: ProjectSortOption,
) {
  return useQuery<RoadmapProjectItem[], Error>({
    queryKey: [
      "resources-roadmap-projects",
      roadmapSlug,
      difficulty || "all",
      sort || "default",
    ],
    queryFn: () => getRoadmapProjects(roadmapSlug!, difficulty, sort),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!roadmapSlug,
  });
}

/**
 * Hook to fetch single project detail by slug with full requirements and checklist.
 */
export function useProjectDetailQuery(
  projectSlug: string | undefined,
  options?: { initialData?: RoadmapProjectItem },
) {
  return useQuery<RoadmapProjectItem, Error>({
    queryKey: ["resources-project-detail", projectSlug],
    queryFn: () => getProjectBySlug(projectSlug!),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!projectSlug,
    ...options,
  });
}

/**
 * Hook to explore and search projects across all roadmaps.
 */
export function useProjectsQuery(params?: GetProjectsParams) {
  return useQuery<PaginatedProjectsResponse, Error>({
    queryKey: ["resources-projects-catalog", params],
    queryFn: () => getProjects(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to explore and search projects across all roadmaps with auto-scroll infinite pagination.
 */
export function useInfiniteProjectsQuery(
  params?: GetProjectsParams,
  initialData?: PaginatedProjectsResponse,
) {
  const limit = params?.limit ?? 18;
  const hasFilters =
    (!!params?.roadmap && params.roadmap !== "all") ||
    (!!params?.difficulty && params.difficulty !== "all") ||
    !!params?.search ||
    !!params?.topic ||
    (!!params?.sort && params.sort !== "default");

  const effectiveInitialData = hasFilters ? undefined : initialData;

  return useInfiniteQuery<PaginatedProjectsResponse, Error>({
    queryKey: ["resources-projects-catalog-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getProjects({ ...params, page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.projects && lastPage.projects.length < limit) {
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
 * Hook to fetch popular / high-engagement projects.
 */
export function usePopularProjectsQuery(limit = 10) {
  return useQuery<RoadmapProjectItem[], Error>({
    queryKey: ["resources-projects-popular", limit],
    queryFn: () => getPopularProjects(limit),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch all roadmap project categories with live counts.
 */
export function useProjectCategoriesQuery() {
  return useQuery<ProjectCategory[], Error>({
    queryKey: ["resources-projects-categories"],
    queryFn: () => getProjectCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch projects created by a user with status & pagination filters.
 */
export function useUserProjectsQuery(
  username: string | undefined,
  params?: { status?: string; page?: number; limit?: number },
) {
  return useQuery<UserProjectsResponse, Error>({
    queryKey: ["user-projects", username, params],
    queryFn: () => getUserProjects(username!, params),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
