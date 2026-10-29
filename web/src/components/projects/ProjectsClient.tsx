"use client";

import React, { useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  ProjectsDesktopSidebar,
  ProjectsMobileHeader,
} from "./projects-sidebar";
import { ProjectsHeader } from "./projects-header";
import { ProjectsDifficultyTabs } from "./projects-difficulty-tabs";
import { ProjectsGrid } from "./projects-grid";
import {
  useProjectCategoriesQuery,
  useProjectsQuery,
  useInfiniteProjectsQuery,
} from "@/hooks/queries/use-project.queries";
import { useProjectsStore } from "@/store/use-projects-store";
import type {
  ProjectCategory,
  PaginatedProjectsResponse,
} from "@/types/project";

interface ProjectsClientProps {
  initialCategories?: ProjectCategory[];
  initialProjects?: PaginatedProjectsResponse;
}

export function ProjectsClient({
  initialCategories,
  initialProjects,
}: ProjectsClientProps) {
  // Store filter state
  const selectedCategory = useProjectsStore((s) => s.selectedCategory);
  const setSelectedCategory = useProjectsStore((s) => s.setSelectedCategory);
  const searchQuery = useProjectsStore((s) => s.searchQuery);
  const setSearchQuery = useProjectsStore((s) => s.setSearchQuery);
  const selectedDifficulty = useProjectsStore((s) => s.selectedDifficulty);
  const setSelectedDifficulty = useProjectsStore(
    (s) => s.setSelectedDifficulty,
  );
  const selectedSort = useProjectsStore((s) => s.selectedSort);
  const setSelectedSort = useProjectsStore((s) => s.setSelectedSort);
  const resetFilters = useProjectsStore((s) => s.resetFilters);

  // Dynamic Categories from API / DB
  const {
    data: categories = initialCategories || [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useProjectCategoriesQuery();

  // Active Category Label
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  const activeCategoryTitle =
    selectedCategory === "all"
      ? "All Projects"
      : activeCategory?.title || selectedCategory;

  // Infinite Query for projects with auto-scroll pagination
  const {
    data: projectsInfiniteData,
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch: refetchProjects,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProjectsQuery(
    {
      roadmap: selectedCategory === "all" ? undefined : selectedCategory,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      search: searchQuery.trim() || undefined,
      sort: selectedSort,
      limit: 18,
    },
    initialProjects,
  );

  // Auto-scroll infinite intersection observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isProjectsLoading) {
      fetchNextPage();
    }
  }, [
    inView,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isProjectsLoading,
  ]);

  // Flatten the infinite pages into a single array
  const projects = useMemo(() => {
    const flat =
      projectsInfiniteData?.pages.flatMap((page) => page.projects) || [];
    if (
      flat.length === 0 &&
      selectedCategory === "all" &&
      !searchQuery &&
      selectedDifficulty === "all" &&
      selectedSort === "default"
    ) {
      return initialProjects?.projects || [];
    }
    return flat;
  }, [
    projectsInfiniteData,
    initialProjects,
    selectedCategory,
    searchQuery,
    selectedDifficulty,
    selectedSort,
  ]);

  const totalCount =
    projectsInfiniteData?.pages[0]?.total ??
    initialProjects?.total ??
    projects.length;

  // Query all unfiltered projects for the current category to calculate difficulty pill counts
  const { data: allUnfilteredData } = useProjectsQuery({
    roadmap: selectedCategory === "all" ? undefined : selectedCategory,
    difficulty: "all",
    limit: 150,
  });

  const allCategoryProjects = allUnfilteredData?.projects || [];

  const difficultyCounts = useMemo(() => {
    return {
      all: allCategoryProjects.length,
      beginner: allCategoryProjects.filter((p) => p.difficulty === "beginner")
        .length,
      intermediate: allCategoryProjects.filter(
        (p) => p.difficulty === "intermediate",
      ).length,
      advanced: allCategoryProjects.filter((p) => p.difficulty === "advanced")
        .length,
    };
  }, [allCategoryProjects]);

  const isSearching = searchQuery.trim().length > 0;
  const isCategoryEmpty =
    !isProjectsLoading &&
    (activeCategory?.count === 0 ||
      (allCategoryProjects.length === 0 && !isSearching));

  return (
    <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
      <div className="flex w-full flex-col lg:flex-row">
        {/* Mobile Slide-out Header */}
        <ProjectsMobileHeader
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setSearchQuery("");
          }}
          isLoading={isCategoriesLoading}
          error={categoriesError}
          onRetry={() => refetchCategories()}
        />

        {/* Desktop Sticky Sidebar */}
        <ProjectsDesktopSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setSearchQuery("");
          }}
          isLoading={isCategoriesLoading}
          error={categoriesError}
          onRetry={() => refetchCategories()}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-8 lg:px-12 pt-40 lg:pt-20 pb-16 max-h-screen overflow-y-auto mx-auto relative space-y-6">
            {/* Modular Header */}
            <ProjectsHeader
              categoryTitle={activeCategoryTitle}
              totalCount={totalCount}
              categoryCount={activeCategory?.count}
              isSearching={isSearching}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
            />

            {/* Modular Difficulty Tabs */}
            <ProjectsDifficultyTabs
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              counts={difficultyCounts}
              selectedSort={selectedSort}
              onSelectSort={setSelectedSort}
            />

            {/* Modular Projects Grid with QueryGuard & Infinite Scroll */}
            <ProjectsGrid
              projects={projects}
              isLoading={isProjectsLoading && projects.length === 0}
              error={projectsError}
              onRetry={() => refetchProjects()}
              categoryTitle={activeCategoryTitle}
              isCategoryEmpty={isCategoryEmpty}
              isSearching={isSearching}
              searchQuery={searchQuery}
              selectedDifficulty={selectedDifficulty}
              onResetFilters={resetFilters}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              loadMoreRef={loadMoreRef}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
