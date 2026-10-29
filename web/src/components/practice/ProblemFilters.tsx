"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProblemFiltersProps } from "@/types/component.types";
import { ButtonGroup } from "../ui/button-group";
import type { Problem } from "@/types/api";
import { Search } from "lucide-react";

export type DifficultyFilter = "All" | Problem["difficulty"];



export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  search,
  setSearch,
  difficultyFilter,
  setDifficultyFilter,
  topicFilter,
  setTopicFilter,
  onReset,
  isSelectPage,
}) => {
  return (
    <header className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isSelectPage ? "Select Problem" : "Problems"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            {isSelectPage
              ? "Browse and select a problem to begin the session."
              : "Solve curated problems to sharpen your skills."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <ButtonGroup>
              {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map(
                (d) => (
                  <Button
                    key={d}
                    variant={difficultyFilter === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyFilter(d)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold h-8"
                  >
                    {d}
                  </Button>
                ),
              )}
            </ButtonGroup>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative w-full">
           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug or number"
            className="pl-9 pr-9 bg-card/50 border-border h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            placeholder="Topic (e.g. Array)"
            className="bg-card/50 border-border h-10"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
};
