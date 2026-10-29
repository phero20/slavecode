"use client";

import React, { useState, useMemo } from "react";
import {
  FolderGit2,
  Search,
  SearchX,
  X,
  Layers,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRoadmapProjectsQuery } from "@/hooks/queries/use-project.queries";
import { useResourceStore } from "@/store/use-resource-store";
import type { ProjectDifficulty, ProjectSortOption } from "@/types/project";
import { ProjectCard } from "@/components/projects/project-card";
import { RoadmapProjectsSkeleton } from "@/components/skeletons";
import { QueryGuard } from "@/components/shared/QueryGuard";

const DIFFICULTY_TABS: Array<{
  id: string;
  value: ProjectDifficulty | "all";
  label: string;
}> = [
  {
    id: "project-difficulty-tab-all",
    value: "all",
    label: "All Levels",
  },
  {
    id: "project-difficulty-tab-beginner",
    value: "beginner",
    label: "Beginner",
  },
  {
    id: "project-difficulty-tab-intermediate",
    value: "intermediate",
    label: "Intermediate",
  },
  {
    id: "project-difficulty-tab-advanced",
    value: "advanced",
    label: "Advanced",
  },
];

const SORT_OPTIONS: Array<{ value: ProjectSortOption; label: string }> = [
  { value: "default", label: "Most Voted" },
  { value: "newest", label: "Newest" },
];

interface RoadmapProjectsViewProps {
  roadmapSlug: string;
  roadmapTitle: string;
}

export function RoadmapProjectsView({
  roadmapSlug,
  roadmapTitle,
}: RoadmapProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<ProjectSortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);

  const selectedDifficulty = useResourceStore(
    (state) => state.projectDifficultyByRoadmap[roadmapSlug] || "all"
  );
  const setProjectDifficulty = useResourceStore(
    (state) => state.setProjectDifficulty
  );

  // Fetch projects for this roadmap
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useRoadmapProjectsQuery(roadmapSlug, selectedDifficulty, selectedSort);

  // Client-side text filter by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills?.some((s) => s.toLowerCase().includes(q)) ||
        p.topics?.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <span>Projects for {roadmapTitle}</span>
        </h2>
      </div>

      {/* Tabs Container */}
      <Tabs
        value={selectedDifficulty}
        onValueChange={(val) =>
          setProjectDifficulty(roadmapSlug, val as ProjectDifficulty | "all")
        }
        className="w-full space-y-6"
      >
        {/* Underline Tabs matching projects-difficulty-tabs */}
        <div className="w-full border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 sm:pb-0">
          <TabsList
            id="projects-difficulty-tabs-list"
            className="justify-start border-none rounded-none h-auto p-0 bg-transparent gap-6 sm:gap-8 -mb-px overflow-x-auto scrollbar-hide"
          >
            {DIFFICULTY_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                id={tab.id}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-1 py-3 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-foreground text-muted-foreground cursor-pointer flex items-center gap-2"
              >
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Clean, Non-jumpy Popover + Command Sort */}
          <div className="flex items-center gap-2 self-end sm:self-center mb-1 sm:mb-0">
            <Popover open={sortOpen} onOpenChange={setSortOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="roadmap-projects-sort-trigger"
                  variant="outline"
                  size="sm"
                  role="combobox"
                  aria-expanded={sortOpen}
                  className="h-8 text-xs font-normal border-border gap-2 px-3 bg-card/40 hover:bg-accent cursor-pointer"
                >
                  <span className="text-muted-foreground">Sort:</span>
                  <span className="font-medium text-foreground">
                    {selectedSort === "newest" ? "Newest" : "Most Voted"}
                  </span>
                  <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                id="roadmap-projects-sort-content"
                align="end"
                className="w-[140px] p-1 shadow-md"
                sideOffset={6}
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = selectedSort === opt.value;
                        return (
                          <CommandItem
                            key={opt.value}
                            id={`roadmap-projects-sort-opt-${opt.value}`}
                            value={opt.value}
                            onSelect={() => {
                              setSelectedSort(opt.value);
                              setSortOpen(false);
                            }}
                            className="cursor-pointer text-xs flex items-center justify-between py-1.5 px-2 rounded-sm"
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Toolbar: Search input + project count indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="project-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by keyword, skill, topic..."
              className="pl-9 pr-9 bg-card/50 border-border h-10 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                id="project-search-clear-btn"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 font-medium">
            <Layers className="h-4 w-4 text-primary/70" />
            <span>
              {isLoading ? (
                "Loading projects..."
              ) : (
                <>
                  Showing <strong className="text-foreground font-semibold">{filteredProjects.length}</strong> {filteredProjects.length === 1 ? "project" : "projects"}
                </>
              )}
            </span>
          </div> */}
        </div>

        {/* Master State Orchestrator via QueryGuard */}
        <QueryGuard
          loading={isLoading}
          error={error}
          data={filteredProjects}
          isEmpty={filteredProjects.length === 0}
          skeleton={<RoadmapProjectsSkeleton />}
          onRetry={() => refetch()}
          emptyIcon={searchQuery ? SearchX : FolderGit2}
          emptyTitle={searchQuery ? "No matching projects" : "No projects found"}
          emptyMessage={
            searchQuery
              ? `No projects match "${searchQuery}" under ${selectedDifficulty === "all" ? "any level" : selectedDifficulty + " level"}.`
              : `There are currently no ${selectedDifficulty === "all" ? "" : selectedDifficulty + " "}projects for this roadmap.`
          }
          emptyAction={
            searchQuery || selectedDifficulty !== "all" || selectedSort !== "default" ? (
              <Button
                id="reset-project-filters-btn"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setProjectDifficulty(roadmapSlug, "all");
                  setSelectedSort("default");
                }}
                className="text-xs h-8 cursor-pointer"
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id || project.slug}
                project={project}
                index={index}
              />
            ))}
          </div>
        </QueryGuard>
      </Tabs>
    </div>
  );
}

