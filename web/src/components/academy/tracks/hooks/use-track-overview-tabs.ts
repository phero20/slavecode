"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSolvedExercisesQuery } from "@/hooks/queries/use-academy.queries";
import { useAcademyStore } from "@/store/use-academy-store";
import { useIsMounted } from "@/hooks/shared/use-is-mounted";

export interface UseTrackOverviewTabsResult {
  activeTab: string;
  solvedExercises: string[];
  handleTabChange: (tab: string) => void;
}

export function useTrackOverviewTabs(slug: string): UseTrackOverviewTabsResult {
  const searchParams = useSearchParams();
  const isMounted = useIsMounted();

  const { data: solvedExercises = [] } = useSolvedExercisesQuery(slug);

  const allowedTabs = useMemo(
    () => new Set(["about", "learn", "practice"]),
    []
  );

  const storeActiveTab = useAcademyStore(
    (s) => s.activeOverviewTabByTrack[slug] || "about"
  );
  const setOverviewTab = useAcademyStore((s) => s.setOverviewTab);

  const activeTab = isMounted ? storeActiveTab : "about";

  // Fix Next.js scroll preservation bug when navigating with loading.tsx
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Synchronize tab from URL search parameters on mount or URL change
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;

    if (allowedTabs.has(tabParam)) {
      setOverviewTab(slug, tabParam);
    }
  }, [slug, searchParams, allowedTabs, setOverviewTab]);

  // Sync tab with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab && allowedTabs.has(urlTab)) {
        setOverviewTab(slug, urlTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [slug, allowedTabs, setOverviewTab]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const nextTab = allowedTabs.has(tab) ? tab : "about";
      setOverviewTab(slug, nextTab);

      // Instant local URL update — zero Next.js server roundtrips or lag
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", nextTab);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [slug, allowedTabs, setOverviewTab]
  );

  return {
    activeTab,
    solvedExercises: solvedExercises || [],
    handleTabChange,
  };
}
