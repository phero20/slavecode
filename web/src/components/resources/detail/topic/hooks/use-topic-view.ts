import { useMemo } from "react";
import { useRoadmapTopicQuery } from "@/hooks/queries/use-resource.queries";
import { tones } from "@/lib/tones";
import type { TopicResourceItem, RoadmapTopic } from "@/types/resource";

export type ToneItem = (typeof tones)[number];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export interface UseTopicViewOptions {
  roadmapSlug: string;
  topicId: string;
  topicLabel: string;
}

export interface UseTopicViewResult {
  displayTitle: string;
  description: string;
  resources: TopicResourceItem[];
  tone: ToneItem;
  topicData: RoadmapTopic | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTopicView({
  roadmapSlug,
  topicId,
  topicLabel,
}: UseTopicViewOptions): UseTopicViewResult {
  const tone = useMemo(() => {
    const toneIndex = Math.abs(hashSeed(topicLabel || topicId)) % tones.length;
    return tones[toneIndex];
  }, [topicLabel, topicId]);

  const {
    data: topicData,
    isLoading,
    isError,
    error,
    refetch,
  } = useRoadmapTopicQuery(roadmapSlug, topicId, true);

  const displayTitle = topicData?.title || topicLabel;
  const description = topicData?.description || "";
  const resources: TopicResourceItem[] = topicData?.resources || [];

  return {
    displayTitle,
    description,
    resources,
    tone,
    topicData,
    isLoading,
    isError,
    error,
    refetch,
  };
}

