import React, { useMemo } from "react";
import {
  FileText,
  Video,
  GraduationCap,
  BookOpen,
  Headphones,
  Code2,
  GitFork,
  Globe,
  ShieldCheck,
} from "lucide-react";
import type { TopicResourceItem, TopicResourceType } from "@/types/resource";

export const TYPE_LABELS: Record<TopicResourceType, string> = {
  official: "Official",
  article: "Articles",
  video: "Videos",
  course: "Courses",
  roadmap: "Roadmaps",
  book: "Books",
  podcast: "Podcasts",
  opensource: "Open Source",
  other: "Other",
};

export const TYPE_ICONS: Record<
  TopicResourceType,
  React.ComponentType<{ className?: string }>
> = {
  official: ShieldCheck,
  article: FileText,
  video: Video,
  course: GraduationCap,
  roadmap: GitFork,
  book: BookOpen,
  podcast: Headphones,
  opensource: Code2,
  other: Globe,
};

const RESOURCE_ORDER: TopicResourceType[] = [
  "official",
  "article",
  "video",
  "course",
  "book",
  "podcast",
  "opensource",
  "roadmap",
  "other",
];

export interface UseTopicResourcesResult {
  presentTypes: TopicResourceType[];
  grouped: Partial<Record<TopicResourceType, TopicResourceItem[]>>;
  hasResources: boolean;
  hasMultipleTypes: boolean;
}

export function useTopicResources(
  resources: TopicResourceItem[] = []
): UseTopicResourcesResult {
  // Derive the unique types present in resources, in a stable order
  const presentTypes = useMemo(() => {
    const seen = new Set(resources.map((r) => r.type));
    return RESOURCE_ORDER.filter((t) => seen.has(t));
  }, [resources]);

  // Group resources by type
  const grouped = useMemo(() => {
    const map: Partial<Record<TopicResourceType, TopicResourceItem[]>> = {};
    for (const item of resources) {
      if (!map[item.type]) map[item.type] = [];
      map[item.type]!.push(item);
    }
    return map;
  }, [resources]);

  const hasResources = Boolean(resources && resources.length > 0);
  const hasMultipleTypes = presentTypes.length > 1;

  return {
    presentTypes,
    grouped,
    hasResources,
    hasMultipleTypes,
  };
}
