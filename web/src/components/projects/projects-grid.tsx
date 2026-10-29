"use client";

import React from "react";
import { FolderGit2, SearchX, PlusCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RoadmapProjectsSkeleton } from "@/components/skeletons";
import { ProjectCard } from "./project-card";
import type { RoadmapProjectItem, ProjectDifficulty } from "@/types/project";

export interface ProjectsGridProps {
  projects: RoadmapProjectItem[];
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  categoryTitle: string;
  isCategoryEmpty: boolean;
  isSearching: boolean;
  searchQuery: string;
  selectedDifficulty: ProjectDifficulty | "all";
  onResetFilters: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
}

export function ProjectsGrid({
  projects,
  isLoading,
  error,
  onRetry,
  categoryTitle,
  isCategoryEmpty,
  isSearching,
  searchQuery,
  selectedDifficulty,
  onResetFilters,
  isFetchingNextPage = false,
  hasNextPage = false,
  loadMoreRef,
}: ProjectsGridProps) {
  const emptyTitle = isSearching
    ? "No matching projects"
    : isCategoryEmpty
      ? `No projects yet for ${categoryTitle}`
      : `No ${selectedDifficulty} projects found`;

  const emptyMessage = isSearching
    ? `No projects match "${searchQuery}" under ${
        selectedDifficulty === "all"
          ? "any level"
          : selectedDifficulty + " level"
      }.`
    : isCategoryEmpty
      ? `We are currently curating and building project specs for ${categoryTitle}. You can submit a project idea to help the community!`
      : `There are currently no ${selectedDifficulty} projects for this category.`;

  const emptyAction = isCategoryEmpty ? (
    <Button
      id="upload-project-idea-btn"
      variant="default"
      size="sm"
      className="text-xs h-9 cursor-pointer gap-2"
      onClick={() => {
        window.open(
          "https://github.com/phero20/slavecode/issues/new?title=[Project+Idea]+" +
            encodeURIComponent(categoryTitle),
          "_blank",
        );
      }}
    >
      <PlusCircle className="h-4 w-4" />
      <span>Upload Project Idea</span>
    </Button>
  ) : isSearching || selectedDifficulty !== "all" ? (
    <Button
      id="reset-projects-filters-btn"
      variant="outline"
      size="sm"
      onClick={onResetFilters}
      className="text-xs h-8 cursor-pointer gap-1.5"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span>Reset Filters</span>
    </Button>
  ) : undefined;

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={projects}
      isEmpty={!isLoading && projects.length === 0}
      skeleton={<RoadmapProjectsSkeleton count={9} />}
      onRetry={onRetry}
      emptyIcon={isCategoryEmpty ? FolderGit2 : SearchX}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      emptyAction={emptyAction}
    >
      <div className="space-y-6 pb-16">
        <div
          id="projects-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              index={index}
            />
          ))}
        </div>

        {/* Loading next page skeletons */}
        {isFetchingNextPage && (
          <div className="pt-2">
            <RoadmapProjectsSkeleton count={12} />
          </div>
        )}

        {/* Infinite Scroll Trigger Sentinel */}
        <div ref={loadMoreRef} className="py-4 flex justify-center w-full">
          {!hasNextPage && projects.length > 0 && !isLoading && (
            <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
              You've reached the end of the projects.
            </p>
          )}
        </div>
      </div>
    </QueryGuard>
  );
}
