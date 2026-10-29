"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRoadmaps,
  getRoadmapBySlug,
  getRoadmapTopic,
  getRoadmapTopics,
} from "@/services/queries/resource.queries";
import type {
  RoadmapSummary,
  RoadmapDetail,
  GetRoadmapsParams,
  RoadmapTopic,
} from "@/types/resource";

/**
 * Hook to fetch the roadmaps list with optional category filter and search query.
 */
export function useRoadmapsQuery(params?: GetRoadmapsParams) {
  return useQuery<RoadmapSummary[], Error>({
    queryKey: [
      "resources-roadmaps",
      params?.category || "all",
      params?.query || "",
    ],
    queryFn: () => getRoadmaps(params),
    staleTime: 1000 * 60 * 30, // 30 minutes in browser cache
  });
}

/**
 * Hook to fetch full interactive roadmap details and graph by slug.
 */
export function useRoadmapDetailQuery(slug: string) {
  return useQuery<RoadmapDetail, Error>({
    queryKey: ["resources-roadmap-detail", slug],
    queryFn: () => getRoadmapBySlug(slug),
    staleTime: 1000 * 60 * 60, // 1 hour (roadmap graph remains stable)
    enabled: !!slug,
  });
}

/**
 * Hook to fetch topic guide content, markdown summary, and curated resources for an interactive canvas node.
 */
export function useRoadmapTopicQuery(
  roadmapSlug: string | undefined,
  nodeId: string | undefined,
  enabled: boolean = true
) {
  return useQuery<RoadmapTopic, Error>({
    queryKey: ["resources-roadmap-topic", roadmapSlug, nodeId],
    queryFn: () => getRoadmapTopic(roadmapSlug!, nodeId!),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours in browser cache
    enabled: enabled && !!roadmapSlug && !!nodeId,
  });
}

/**
 * Hook to fetch all topic summaries for a roadmap.
 */
export function useRoadmapTopicsQuery(roadmapSlug: string | undefined) {
  return useQuery<Partial<RoadmapTopic>[], Error>({
    queryKey: ["resources-roadmap-topics-list", roadmapSlug],
    queryFn: () => getRoadmapTopics(roadmapSlug!),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!roadmapSlug,
  });
}


