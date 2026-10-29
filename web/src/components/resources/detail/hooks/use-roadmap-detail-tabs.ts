"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { RoadmapDetail } from "@/types/resource";
import type { SelectedTopic } from "../canvas/RoadmapCanvas";
import { useResourceStore, type OpenTopicTab } from "@/store/use-resource-store";
import { useIsMounted } from "@/hooks/shared/use-is-mounted";

const EMPTY_TOPICS: OpenTopicTab[] = [];

export function findTopicNode(
  nodes: any[] | undefined,
  topicId: string
): OpenTopicTab | null {
  if (!nodes || !topicId) return null;
  const decoded = decodeURIComponent(topicId);
  const match = nodes.find(
    (n) => String(n.id) === topicId || String(n.id) === decoded
  );
  if (!match) return null;
  return {
    id: String(match.id),
    label: match.data?.label || match.title || "Topic Guide",
    legend: match.data?.legend,
  };
}

export interface UseRoadmapDetailTabsResult {
  activeTab: string;
  openTopics: OpenTopicTab[];
  title: string;
  nodesCount: number;
  edgesCount: number;
  handleTabChange: (tab: string) => void;
  handleSelectTopic: (topic: SelectedTopic) => void;
  handleCloseTopic: (topicId: string) => void;
}

export function useRoadmapDetailTabs(
  roadmap: RoadmapDetail
): UseRoadmapDetailTabsResult {
  const searchParams = useSearchParams();
  const isMounted = useIsMounted();

  const allowedTabs = useMemo(
    () => new Set(["roadmap", "project", "ai-tutor"]),
    []
  );

  const isAllowedTab = useCallback(
    (tab: string) => allowedTabs.has(tab) || tab.startsWith("topic-"),
    [allowedTabs]
  );

  // Zustand Store selectors & actions
  const storeOpenTopics = useResourceStore(
    (s) => s.openTopicsByRoadmap[roadmap.slug] ?? EMPTY_TOPICS
  );
  const storeActiveTab = useResourceStore(
    (s) => s.activeTabByRoadmap[roadmap.slug] || "roadmap"
  );
  const openTopic = useResourceStore((s) => s.openTopic);
  const closeTopic = useResourceStore((s) => s.closeTopic);
  const setStoreActiveTab = useResourceStore((s) => s.setActiveTab);
  const ensureTopicOpen = useResourceStore((s) => s.ensureTopicOpen);

  // Hydration safety: use store data after mount, default to clean SSR values before mount
  const openTopics = isMounted ? storeOpenTopics : EMPTY_TOPICS;
  const activeTab = isMounted ? storeActiveTab : "roadmap";

  // Fix scroll preservation bug when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Synchronize tab from URL search parameters on mount or URL changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    if (allowedTabs.has(tabParam)) {
      setStoreActiveTab(roadmap.slug, tabParam);
    } else if (tabParam.startsWith("topic-")) {
      const topicId = tabParam.replace(/^topic-/, "");
      const existing = useResourceStore
        .getState()
        .openTopicsByRoadmap[roadmap.slug]?.find((t) => t.id === topicId);
      const matched = existing || findTopicNode(roadmap.nodes, topicId);

      if (matched) {
        ensureTopicOpen(roadmap.slug, matched);
      } else {
        // If the topic is invalid, fallback to roadmap and clean URL
        setStoreActiveTab(roadmap.slug, "roadmap");
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", "roadmap");
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  }, [
    roadmap.slug,
    roadmap.nodes,
    searchParams,
    allowedTabs,
    ensureTopicOpen,
    setStoreActiveTab,
  ]);

  // Sync tab with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") || "roadmap";
      if (allowedTabs.has(urlTab)) {
        setStoreActiveTab(roadmap.slug, urlTab);
      } else if (urlTab.startsWith("topic-")) {
        const topicId = urlTab.replace(/^topic-/, "");
        const matched = findTopicNode(roadmap.nodes, topicId);
        if (matched) {
          ensureTopicOpen(roadmap.slug, matched);
        } else {
          setStoreActiveTab(roadmap.slug, "roadmap");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    roadmap.slug,
    roadmap.nodes,
    allowedTabs,
    ensureTopicOpen,
    setStoreActiveTab,
  ]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const nextTab = isAllowedTab(tab) ? tab : "roadmap";
      setStoreActiveTab(roadmap.slug, nextTab);

      // Instant local URL update — zero Next.js server roundtrips or lag
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", nextTab);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [roadmap.slug, isAllowedTab, setStoreActiveTab]
  );

  const handleSelectTopic = useCallback(
    (topic: SelectedTopic) => {
      openTopic(roadmap.slug, {
        id: topic.id,
        label: topic.label,
        legend: topic.legend,
      });

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", `topic-${topic.id}`);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [roadmap.slug, openTopic]
  );

  const handleCloseTopic = useCallback(
    (topicId: string) => {
      closeTopic(roadmap.slug, topicId);

      const nextActive =
        useResourceStore.getState().activeTabByRoadmap[roadmap.slug] ||
        "roadmap";

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", nextActive);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [roadmap.slug, closeTopic]
  );

  const title = roadmap.title?.page || roadmap.title?.card || roadmap.slug;
  const nodesCount = roadmap.nodes?.length || (roadmap as any).nodesCount || 0;
  const edgesCount = roadmap.edges?.length || 0;

  return {
    activeTab,
    openTopics,
    title,
    nodesCount,
    edgesCount,
    handleTabChange,
    handleSelectTopic,
    handleCloseTopic,
  };
}
