import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProjectDifficulty } from "@/types/project";
import type { ResourceSortOption } from "@/types/roadmap-resource";

export interface OpenTopicTab {
  id: string;
  label: string;
  legend?: {
    label?: string;
    color?: string;
  };
}

interface ResourceStoreState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Catalog overview filters
  selectedCategory: string;
  searchQuery: string;
  selectedNodeId: string | null;
  isSidebarOpen: boolean;

  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  resetFilters: () => void;

  // Roadmap detail open tabs & active tab (keyed by roadmap slug)
  openTopicsByRoadmap: Record<string, OpenTopicTab[]>;
  activeTabByRoadmap: Record<string, string>;

  // Project state
  projectDifficultyByRoadmap: Record<string, ProjectDifficulty | "all">;
  setProjectDifficulty: (slug: string, difficulty: ProjectDifficulty | "all") => void;
  selectedProjectSlug: string | null;
  setSelectedProjectSlug: (slug: string | null) => void;

  resourceTypeByRoadmap: Record<string, string | "all">;
  setResourceType: (slug: string, type: string | "all") => void;
  resourceSortByRoadmap: Record<string, ResourceSortOption>;
  setResourceSort: (slug: string, sort: ResourceSortOption) => void;
  isAddResourceFormOpen: boolean;
  setIsAddResourceFormOpen: (isOpen: boolean) => void;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;

  openTopic: (slug: string, topic: OpenTopicTab) => void;
  closeTopic: (slug: string, topicId: string) => void;
  setActiveTab: (slug: string, tab: string) => void;
  ensureTopicOpen: (slug: string, topic: OpenTopicTab) => void;
}

export const useResourceStore = create<ResourceStoreState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Catalog filters
      selectedCategory: "all",
      searchQuery: "",
      selectedNodeId: null,
      isSidebarOpen: false,

      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedNodeId: (nodeId) =>
        set({
          selectedNodeId: nodeId,
          isSidebarOpen: Boolean(nodeId),
        }),
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      resetFilters: () =>
        set({
          selectedCategory: "all",
          searchQuery: "",
          selectedNodeId: null,
          isSidebarOpen: false,
        }),

      // Roadmap detail tabs state
      openTopicsByRoadmap: {},
      activeTabByRoadmap: {},

      // Project state
      projectDifficultyByRoadmap: {},
      setProjectDifficulty: (slug, difficulty) =>
        set((state) => ({
          projectDifficultyByRoadmap: {
            ...state.projectDifficultyByRoadmap,
            [slug]: difficulty,
          },
        })),
      selectedProjectSlug: null,
      setSelectedProjectSlug: (slug) => set({ selectedProjectSlug: slug }),

      resourceTypeByRoadmap: {},
      setResourceType: (slug, type) =>
        set((state) => ({
          resourceTypeByRoadmap: {
            ...state.resourceTypeByRoadmap,
            [slug]: type,
          },
        })),
      resourceSortByRoadmap: {},
      setResourceSort: (slug, sort) =>
        set((state) => ({
          resourceSortByRoadmap: {
            ...state.resourceSortByRoadmap,
            [slug]: sort,
          },
        })),
      isAddResourceFormOpen: false,
      setIsAddResourceFormOpen: (isOpen) => set({ isAddResourceFormOpen: isOpen }),
      selectedResourceId: null,
      setSelectedResourceId: (id) => set({ selectedResourceId: id }),

      openTopic: (slug, topic) =>
        set((state) => {
          const current = state.openTopicsByRoadmap[slug] || [];
          const exists = current.some((t) => t.id === topic.id);
          const next = exists ? current : [...current, topic];
          return {
            openTopicsByRoadmap: {
              ...state.openTopicsByRoadmap,
              [slug]: next,
            },
            activeTabByRoadmap: {
              ...state.activeTabByRoadmap,
              [slug]: `topic-${topic.id}`,
            },
          };
        }),

      closeTopic: (slug, topicId) =>
        set((state) => {
          const current = state.openTopicsByRoadmap[slug] || [];
          const next = current.filter((t) => t.id !== topicId);
          const active = state.activeTabByRoadmap[slug];
          const newActive =
            active === `topic-${topicId}`
              ? next.length > 0
                ? `topic-${next[next.length - 1].id}`
                : "roadmap"
              : active || "roadmap";

          return {
            openTopicsByRoadmap: {
              ...state.openTopicsByRoadmap,
              [slug]: next,
            },
            activeTabByRoadmap: {
              ...state.activeTabByRoadmap,
              [slug]: newActive,
            },
          };
        }),

      setActiveTab: (slug, tab) =>
        set((state) => ({
          activeTabByRoadmap: {
            ...state.activeTabByRoadmap,
            [slug]: tab,
          },
        })),

      ensureTopicOpen: (slug, topic) =>
        set((state) => {
          const current = state.openTopicsByRoadmap[slug] || [];
          const exists = current.some((t) => t.id === topic.id);
          const next = exists ? current : [...current, topic];
          return {
            openTopicsByRoadmap: {
              ...state.openTopicsByRoadmap,
              [slug]: next,
            },
            activeTabByRoadmap: {
              ...state.activeTabByRoadmap,
              [slug]: `topic-${topic.id}`,
            },
          };
        }),
    }),
    {
      name: "resources_state_store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        openTopicsByRoadmap: state.openTopicsByRoadmap,
        projectDifficultyByRoadmap: state.projectDifficultyByRoadmap,
        resourceTypeByRoadmap: state.resourceTypeByRoadmap,
        resourceSortByRoadmap: state.resourceSortByRoadmap,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
