"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { TrackConfigResponse } from "@/types/academy";
import { useAcademyStore, type OpenConceptTab } from "@/store/use-academy-store";
import { useCurriculumLayout } from "../use-curriculum-layout";
import { useIsMounted } from "@/hooks/shared/use-is-mounted";

export type ConceptProgressItem = {
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED";
  progress: number;
  total: number;
};

export type ConceptProgressMap = Record<string, ConceptProgressItem>;

const EMPTY_CONCEPTS: OpenConceptTab[] = [];

export interface UseSlugLearnTabsResult {
  levels: ReturnType<typeof useCurriculumLayout>["levels"];
  edges: ReturnType<typeof useCurriculumLayout>["edges"];
  showGraph: boolean;
  activeTab: string;
  activeConcepts: OpenConceptTab[];
  conceptProgressMap: ConceptProgressMap;
  setActiveTab: (tab: string) => void;
  handleConceptClick: (slug: string, name: string) => void;
  handleCloseConcept: (e: React.MouseEvent, slug: string) => void;
}

export function useSlugLearnTabs(
  config: TrackConfigResponse,
  solvedExercises: string[] = []
): UseSlugLearnTabsResult {
  const searchParams = useSearchParams();
  const isMounted = useIsMounted();
  const { levels, edges, showGraph } = useCurriculumLayout(config);
  const defaultTab = showGraph ? "graph" : "timeline";

  const storeActiveConcepts = useAcademyStore(
    (s) => s.openConceptsByTrack[config.slug] ?? EMPTY_CONCEPTS
  );
  const storeActiveTab = useAcademyStore(
    (s) => s.activeLearnTabByTrack[config.slug] || defaultTab
  );

  const openConcept = useAcademyStore((s) => s.openConcept);
  const closeConcept = useAcademyStore((s) => s.closeConcept);
  const setLearnTab = useAcademyStore((s) => s.setLearnTab);
  const ensureConceptOpen = useAcademyStore((s) => s.ensureConceptOpen);

  const activeConcepts = isMounted ? storeActiveConcepts : EMPTY_CONCEPTS;
  const activeTab = isMounted ? storeActiveTab : defaultTab;

  // Calculate status and progress for each concept
  const conceptProgressMap = useMemo<ConceptProgressMap>(() => {
    const map: ConceptProgressMap = {};
    if (!config.concepts) return map;

    config.concepts.forEach((concept) => {
      const requiredExercises =
        config.exercises?.concept?.filter((ex) =>
          ex.concepts?.includes(concept.slug)
        ) || [];
      const total = requiredExercises.length;
      let solvedCount = 0;

      requiredExercises.forEach((ex) => {
        if (solvedExercises.includes(ex.slug)) {
          solvedCount++;
        }
      });

      let status: "COMPLETED" | "IN_PROGRESS" | "LOCKED" = "LOCKED";
      if (total > 0 && solvedCount === total) {
        status = "COMPLETED";
      } else if (solvedCount > 0) {
        status = "IN_PROGRESS";
      }

      map[concept.slug] = { status, progress: solvedCount, total };
    });

    return map;
  }, [config.concepts, config.exercises?.concept, solvedExercises]);

  // Synchronize concept tab with URL search parameter
  useEffect(() => {
    const conceptParam = searchParams.get("concept");
    if (!conceptParam) return;

    const matchedConcept = config.concepts?.find((c) => c.slug === conceptParam);
    if (matchedConcept) {
      ensureConceptOpen(config.slug, {
        slug: matchedConcept.slug,
        name: matchedConcept.name,
      });
    }
  }, [config.slug, config.concepts, searchParams, ensureConceptOpen]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setLearnTab(config.slug, tab);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (tab === "timeline" || tab === "graph") {
          url.searchParams.delete("concept");
        } else {
          url.searchParams.set("concept", tab);
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    [config.slug, setLearnTab]
  );

  const handleConceptClick = useCallback(
    (slug: string, name: string) => {
      openConcept(config.slug, { slug, name });

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("concept", slug);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [config.slug, openConcept]
  );

  const handleCloseConcept = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      e.stopPropagation();

      closeConcept(config.slug, slug, defaultTab);

      const nextActive =
        useAcademyStore.getState().activeLearnTabByTrack[config.slug] ||
        defaultTab;

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (nextActive === "timeline" || nextActive === "graph") {
          url.searchParams.delete("concept");
        } else {
          url.searchParams.set("concept", nextActive);
        }
        window.history.replaceState(null, "", url.toString());
      }
    },
    [config.slug, defaultTab, closeConcept]
  );

  return {
    levels,
    edges,
    showGraph,
    activeTab,
    activeConcepts,
    conceptProgressMap,
    setActiveTab: handleTabChange,
    handleConceptClick,
    handleCloseConcept,
  };
}
