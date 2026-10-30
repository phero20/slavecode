import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResourceSortOption } from "@/types/roadmap-resource";

export interface RoadmapResourcesState {
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedType: string | "all";
  setSelectedType: (type: string | "all") => void;

  selectedSort: ResourceSortOption;
  setSelectedSort: (sort: ResourceSortOption) => void;

  page: number;
  setPage: (page: number) => void;

  isAddFormOpen: boolean;
  setIsAddFormOpen: (isOpen: boolean) => void;

  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;

  resetFilters: () => void;
}

export const useRoadmapResourcesStore = create<RoadmapResourcesState>()(
  persist(
    (set) => ({
      selectedCategory: "all",
      setSelectedCategory: (categoryId) =>
        set({ selectedCategory: categoryId, page: 1 }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

      selectedType: "all",
      setSelectedType: (type) => set({ selectedType: type, page: 1 }),

      selectedSort: "default",
      setSelectedSort: (sort) => set({ selectedSort: sort, page: 1 }),

      page: 1,
      setPage: (page) => set({ page }),

      isAddFormOpen: false,
      setIsAddFormOpen: (isOpen) => set({ isAddFormOpen: isOpen }),

      selectedResourceId: null,
      setSelectedResourceId: (id) => set({ selectedResourceId: id }),

      resetFilters: () =>
        set({
          selectedCategory: "all",
          searchQuery: "",
          selectedType: "all",
          selectedSort: "default",
          page: 1,
        }),
    }),
    {
      name: "slavecode-resources-filter-storage",
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        selectedType: state.selectedType,
        selectedSort: state.selectedSort,
      }),
    }
  )
);
