"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectDifficulty, ProjectSortOption } from "@/types/project";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

export interface DifficultyCounts {
  all: number;
  beginner: number;
  intermediate: number;
  advanced: number;
}

export interface ProjectsDifficultyTabsProps {
  selectedDifficulty: ProjectDifficulty | "all";
  onSelectDifficulty: (difficulty: ProjectDifficulty | "all") => void;
  counts: DifficultyCounts;
  selectedSort: ProjectSortOption;
  onSelectSort: (sort: ProjectSortOption) => void;
}

const DIFFICULTY_TABS: Array<{
  id: string;
  value: ProjectDifficulty | "all";
  label: string;
  countKey: keyof DifficultyCounts;
}> = [
  {
    id: "project-difficulty-tab-all",
    value: "all",
    label: "All Levels",
    countKey: "all",
  },
  {
    id: "project-difficulty-tab-beginner",
    value: "beginner",
    label: "Beginner",
    countKey: "beginner",
  },
  {
    id: "project-difficulty-tab-intermediate",
    value: "intermediate",
    label: "Intermediate",
    countKey: "intermediate",
  },
  {
    id: "project-difficulty-tab-advanced",
    value: "advanced",
    label: "Advanced",
    countKey: "advanced",
  },
];

const SORT_OPTIONS: Array<{ value: ProjectSortOption; label: string }> = [
  { value: "default", label: "Most Voted" },
  { value: "newest", label: "Newest" },
];

export function ProjectsDifficultyTabs({
  selectedDifficulty,
  onSelectDifficulty,
  counts,
  selectedSort,
  onSelectSort,
}: ProjectsDifficultyTabsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Tabs
      value={selectedDifficulty}
      onValueChange={(val) =>
        onSelectDifficulty(val as ProjectDifficulty | "all")
      }
      className="w-full"
    >
      <div className="w-full border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 sm:pb-0">
        <TabsList
          id="projects-difficulty-tabs-list"
          className="justify-start border-none rounded-none h-auto p-0 bg-transparent gap-6 sm:gap-8 -mb-px overflow-x-auto scrollbar-hide"
        >
          {DIFFICULTY_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              id={tab.id}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-1 py-3 text-xs sm:text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-foreground text-muted-foreground cursor-pointer"
            >
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Clean, Non-jumpy Popover + Command Sort */}
        <div className="flex items-center gap-2 self-end sm:self-center mb-1 sm:mb-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="projects-sort-trigger"
                variant="outline"
                size="sm"
                role="combobox"
                aria-expanded={open}
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
              id="projects-sort-content"
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
                          id={`projects-sort-opt-${opt.value}`}
                          value={opt.value}
                          onSelect={() => {
                            onSelectSort(opt.value);
                            setOpen(false);
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
    </Tabs>
  );
}
