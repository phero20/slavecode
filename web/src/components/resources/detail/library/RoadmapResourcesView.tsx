"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Library,
  Search,
  SearchX,
  X,
  Check,
  ChevronsUpDown,
  Plus,
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
import { useRoadmapResourcesQuery } from "@/hooks/queries/use-roadmap-resource.queries";
import { useResourceStore } from "@/store/use-resource-store";
import type { ResourceSortOption } from "@/types/roadmap-resource";
import { RoadmapResourceCard } from "./RoadmapResourceCard";
import { RoadmapResourcesSkeleton } from "@/components/skeletons";
import { QueryGuard } from "@/components/shared/QueryGuard";

const SORT_OPTIONS: Array<{ value: ResourceSortOption; label: string }> = [
  { value: "default", label: "Most Voted" },
  { value: "newest", label: "Newest" },
];

interface RoadmapResourcesViewProps {
  roadmapSlug: string;
  roadmapTitle: string;
}

export function RoadmapResourcesView({
  roadmapSlug,
  roadmapTitle,
}: RoadmapResourcesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  const selectedType = useResourceStore(
    (state) => state.resourceTypeByRoadmap[roadmapSlug] || "all"
  );
  const setResourceType = useResourceStore((state) => state.setResourceType);
  const selectedSort = useResourceStore(
    (state) => state.resourceSortByRoadmap[roadmapSlug] || "default"
  );
  const setResourceSort = useResourceStore((state) => state.setResourceSort);

  const {
    data: resources = [],
    isLoading,
    error,
    refetch,
  } = useRoadmapResourcesQuery(roadmapSlug, "all", selectedSort);

  const typeTabs = useMemo(() => {
    const unique = Array.from(
      new Set(
        resources
          .map((r) => r.type?.trim())
          .filter((t): t is string => Boolean(t))
      )
    ).sort((a, b) => a.localeCompare(b));

    if (
      selectedType !== "all" &&
      !unique.some((t) => t.toLowerCase() === selectedType.toLowerCase())
    ) {
      unique.unshift(selectedType);
    }

    return [
      { value: "all" as const, label: "All Types" },
      ...unique.map((type) => ({ value: type, label: type })),
    ];
  }, [resources, selectedType]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return resources.filter((r) => {
      const matchesType =
        selectedType === "all" ||
        r.type?.toLowerCase() === selectedType.toLowerCase();
      if (!matchesType) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.author || "").toLowerCase().includes(q) ||
        (r.type || "").toLowerCase().includes(q)
      );
    });
  }, [resources, searchQuery, selectedType]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== "all" ||
    selectedSort !== "default";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Resources for {roadmapTitle}</span>
          </h2>
        </div>
        <Link
          href={`/resources/new?roadmap=${encodeURIComponent(roadmapSlug)}`}
          className="w-full sm:w-auto shrink-0"
        >
          <Button
            id="add-resource-header-btn"
            size="lg"
            className="w-full sm:w-auto h-9 text-xs font-semibold px-4 gap-1.5 justify-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </Button>
        </Link>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(val) => setResourceType(roadmapSlug, val)}
        className="w-full space-y-6"
      >
        <div className="w-full border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 sm:pb-0">
          <TabsList
            id="resources-type-tabs-list"
            className="justify-start border-none rounded-none h-auto p-0 bg-transparent gap-6 sm:gap-8 -mb-px overflow-x-auto scrollbar-hide"
          >
            {typeTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                id={`resource-type-tab-${tab.value === "all" ? "all" : tab.value.toLowerCase().replace(/\s+/g, "-")}`}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-1 py-3 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-foreground text-muted-foreground cursor-pointer flex items-center gap-2"
              >
                <span className="whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2 self-end sm:self-center mb-1 sm:mb-0">
            <Popover open={sortOpen} onOpenChange={setSortOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="roadmap-resources-sort-trigger"
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
                id="roadmap-resources-sort-content"
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
                            id={`roadmap-resources-sort-opt-${opt.value}`}
                            value={opt.value}
                            onSelect={() => {
                              setResourceSort(roadmapSlug, opt.value);
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="resource-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources by title, author, type..."
              className="pl-9 pr-9 bg-card/50 border-border h-10 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                id="resource-search-clear-btn"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <QueryGuard
          loading={isLoading}
          error={error}
          data={filteredResources}
          isEmpty={filteredResources.length === 0}
          skeleton={<RoadmapResourcesSkeleton />}
          onRetry={() => refetch()}
          emptyIcon={searchQuery ? SearchX : Library}
          emptyTitle={
            searchQuery ? "No matching resources" : "No resources found"
          }
          emptyMessage={
            searchQuery
              ? `No resources match "${searchQuery}"${selectedType === "all" ? "" : ` under ${selectedType}`}.`
              : `There are currently no ${selectedType === "all" ? "" : selectedType + " "}resources for this roadmap.`
          }
          emptyAction={
            hasActiveFilters ? (
              <Button
                id="reset-resource-filters-btn"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setResourceType(roadmapSlug, "all");
                  setResourceSort(roadmapSlug, "default");
                }}
                className="text-xs h-8 cursor-pointer"
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                id="empty-add-resource-btn"
                asChild
                size="sm"
                className="text-xs h-8 cursor-pointer"
              >
                <Link
                  href={`/resources/new?roadmap=${encodeURIComponent(roadmapSlug)}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Resource</span>
                </Link>
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {filteredResources.map((resource, idx) => (
              <RoadmapResourceCard
                key={resource.id}
                resource={resource}
                index={idx}
              />
            ))}
          </div>
        </QueryGuard>
      </Tabs>
    </div>
  );
}
