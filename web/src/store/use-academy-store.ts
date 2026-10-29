import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OpenConceptTab {
  slug: string;
  name: string;
}

interface AcademyStoreState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Track overview active tab (keyed by track slug, e.g. "about" | "learn" | "practice")
  activeOverviewTabByTrack: Record<string, string>;

  // Learn tab concept sub-tabs & active view (keyed by track slug)
  openConceptsByTrack: Record<string, OpenConceptTab[]>;
  activeLearnTabByTrack: Record<string, string>; // "timeline" | "graph" | conceptSlug

  // Track catalog filters
  searchQuery: string;
  sortBy: string;
  selectedTags: string[];

  // Actions
  setOverviewTab: (trackSlug: string, tab: string) => void;
  openConcept: (trackSlug: string, concept: OpenConceptTab) => void;
  closeConcept: (trackSlug: string, conceptSlug: string, fallbackTab: string) => void;
  setLearnTab: (trackSlug: string, tab: string) => void;
  ensureConceptOpen: (trackSlug: string, concept: OpenConceptTab) => void;

  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setSelectedTags: (tags: string[]) => void;
  resetCatalogFilters: () => void;
}

export const useAcademyStore = create<AcademyStoreState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      activeOverviewTabByTrack: {},
      openConceptsByTrack: {},
      activeLearnTabByTrack: {},

      searchQuery: "",
      sortBy: "popular",
      selectedTags: [],

      setOverviewTab: (trackSlug, tab) =>
        set((state) => ({
          activeOverviewTabByTrack: {
            ...state.activeOverviewTabByTrack,
            [trackSlug]: tab,
          },
        })),

      openConcept: (trackSlug, concept) =>
        set((state) => {
          const current = state.openConceptsByTrack[trackSlug] || [];
          const exists = current.some((c) => c.slug === concept.slug);
          const next = exists ? current : [...current, concept];
          return {
            openConceptsByTrack: {
              ...state.openConceptsByTrack,
              [trackSlug]: next,
            },
            activeLearnTabByTrack: {
              ...state.activeLearnTabByTrack,
              [trackSlug]: concept.slug,
            },
          };
        }),

      closeConcept: (trackSlug, conceptSlug, fallbackTab) =>
        set((state) => {
          const current = state.openConceptsByTrack[trackSlug] || [];
          const next = current.filter((c) => c.slug !== conceptSlug);
          const active = state.activeLearnTabByTrack[trackSlug];
          const newActive =
            active === conceptSlug
              ? next.length > 0
                ? next[next.length - 1].slug
                : fallbackTab
              : active || fallbackTab;

          return {
            openConceptsByTrack: {
              ...state.openConceptsByTrack,
              [trackSlug]: next,
            },
            activeLearnTabByTrack: {
              ...state.activeLearnTabByTrack,
              [trackSlug]: newActive,
            },
          };
        }),

      setLearnTab: (trackSlug, tab) =>
        set((state) => ({
          activeLearnTabByTrack: {
            ...state.activeLearnTabByTrack,
            [trackSlug]: tab,
          },
        })),

      ensureConceptOpen: (trackSlug, concept) =>
        set((state) => {
          const current = state.openConceptsByTrack[trackSlug] || [];
          const exists = current.some((c) => c.slug === concept.slug);
          const next = exists ? current : [...current, concept];
          return {
            openConceptsByTrack: {
              ...state.openConceptsByTrack,
              [trackSlug]: next,
            },
            activeLearnTabByTrack: {
              ...state.activeLearnTabByTrack,
              [trackSlug]: concept.slug,
            },
          };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      resetCatalogFilters: () =>
        set({
          searchQuery: "",
          sortBy: "popular",
          selectedTags: [],
        }),
    }),
    {
      name: "academy_state_store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activeOverviewTabByTrack: state.activeOverviewTabByTrack,
        openConceptsByTrack: state.openConceptsByTrack,
        activeLearnTabByTrack: state.activeLearnTabByTrack,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
