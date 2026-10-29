import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectDifficulty, ProjectSortOption } from "@/types/project";

export interface ProjectsState {
  // Category selection (defaults to "all" for All Projects)
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;

  // Search filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Difficulty filter
  selectedDifficulty: ProjectDifficulty | "all";
  setSelectedDifficulty: (difficulty: ProjectDifficulty | "all") => void;

  // Sort option ("default" = most voted, "newest" = latest created)
  selectedSort: ProjectSortOption;
  setSelectedSort: (sort: ProjectSortOption) => void;

  // Pagination
  page: number;
  setPage: (page: number) => void;

  // Mobile Drawer State
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;

  // Reset
  resetFilters: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      selectedCategory: "all",
      setSelectedCategory: (categoryId) =>
        set({ selectedCategory: categoryId, page: 1, isMobileSidebarOpen: false }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

      selectedDifficulty: "all",
      setSelectedDifficulty: (difficulty) =>
        set({ selectedDifficulty: difficulty, page: 1 }),

      selectedSort: "default",
      setSelectedSort: (sort) => set({ selectedSort: sort, page: 1 }),

      page: 1,
      setPage: (page) => set({ page }),

      isMobileSidebarOpen: false,
      setIsMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

      resetFilters: () =>
        set({
          selectedCategory: "all",
          searchQuery: "",
          selectedDifficulty: "all",
          selectedSort: "default",
          page: 1,
        }),
    }),
    {
      name: "slavecode-projects-filter-storage",
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        selectedDifficulty: state.selectedDifficulty,
        selectedSort: state.selectedSort,
      }),
    }
  )
);
