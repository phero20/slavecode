"use client";

import React from "react";
import Link from "next/link";
import { Search, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ProjectsHeaderProps {
  categoryTitle: string;
  totalCount: number;
  categoryCount?: number;
  isSearching: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function ProjectsHeader({
  categoryTitle,
  totalCount,
  categoryCount,
  isSearching,
  searchQuery,
  onSearchChange,
  onClearSearch,
}: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isSearching ? "Search Results" : categoryTitle + " Projects"}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isSearching
          && `Found ${totalCount} ${
                totalCount === 1 ? "project" : "projects"
              } matching "${searchQuery.trim()}"`
           }
        </p>
      </div>

      {/* Right Controls: Search & Create Project */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64 md:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="projects-search-input"
            type="text"
            className="pl-9 pr-9 bg-card/50 border-border h-10 text-xs sm:text-sm w-full"
            placeholder="Search projects by title, skill..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              id="clear-projects-search-btn"
              type="button"
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear project search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link href="/projects/new" className="w-full sm:w-auto">
          <Button
            id="create-project-header-btn"
            size="lg"
            className="w-full sm:w-auto h-9 text-xs font-semibold px-4 gap-1.5 justify-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
