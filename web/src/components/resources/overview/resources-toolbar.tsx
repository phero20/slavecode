"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, X, Filter, Check } from "lucide-react";

export interface CategoryOption {
  key: string;
  label: string;
  count: number;
}

interface ResourcesToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: CategoryOption[];
  totalCount: number;
}

export function ResourcesToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalCount,
}: ResourcesToolbarProps) {
  const [openCategory, setOpenCategory] = useState(false);

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "Categories"
      : categories.find((c) => c.key === selectedCategory)?.label || "Category";

  return (
    <div className="border-b border-border/60 pb-6">
      {/* Search Input & Category Popover with Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="resources-search-input"
            type="text"
            className="pl-9 pr-9 bg-card/50 border-border h-10"
            placeholder="Search 94 roadmaps (e.g. React, System Design, Docker, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Popover (2-column grid, matching Academy tracks toolbar) */}
        <div className="w-full sm:w-auto shrink-0">
          <Popover open={openCategory} onOpenChange={setOpenCategory}>
            <PopoverTrigger asChild>
              <Button
                id="resources-category-popover-btn"
                variant="outline"
                role="combobox"
                aria-expanded={openCategory}
                className="h-10 w-full sm:w-56 flex items-center justify-between gap-2 overflow-hidden px-3 bg-card/40 border-border"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs sm:text-sm">
                    {selectedCategoryLabel}
                  </span>
                </div>
                {selectedCategory !== "all" ? (
                  <Badge
                    variant="default"
                    className="px-1.5 py-0 rounded-sm text-[10px] font-semibold"
                  >
                    1
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 rounded-sm text-[10px] text-muted-foreground"
                  >
                    {totalCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[320px] md:w-120 p-0"
              align="end"
              sideOffset={8}
            >
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty className="text-xs py-6 text-center text-muted-foreground">
                    No categories found.
                  </CommandEmpty>

                  <CommandGroup heading="Categories">
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {/* All Categories Option */}
                      <CommandItem
                        value="all All Categories"
                        onSelect={() => {
                          setSelectedCategory("all");
                          setOpenCategory(false);
                        }}
                        className={`p-2 cursor-pointer flex items-center justify-between text-xs font-medium rounded-sm focus:bg-primary/20 focus:text-primary aria-selected:bg-primary/20 aria-selected:text-primary ${
                          selectedCategory === "all"
                            ? "bg-primary/20 text-primary"
                            : ""
                        }`}
                      >
                        <span className="truncate">All Categories</span>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="text-[10px] text-muted-foreground">
                            ({totalCount})
                          </span>
                          <Check
                            className={`size-3.5 shrink-0 ${
                              selectedCategory === "all"
                                ? "opacity-100 text-primary"
                                : "opacity-0"
                            }`}
                          />
                        </div>
                      </CommandItem>

                      {/* Individual Categories */}
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat.key;
                        return (
                          <CommandItem
                            key={cat.key}
                            value={`${cat.key} ${cat.label}`}
                            onSelect={() => {
                              setSelectedCategory(cat.key);
                              setOpenCategory(false);
                            }}
                            className={`p-2 cursor-pointer flex items-center justify-between text-xs font-medium rounded-sm focus:bg-primary/20 focus:text-primary aria-selected:bg-primary/20 aria-selected:text-primary ${
                              isSelected ? "bg-primary/20 text-primary" : ""
                            }`}
                          >
                            <span className="truncate">{cat.label}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              <span className="text-[10px] text-muted-foreground">
                                ({cat.count})
                              </span>
                              <Check
                                className={`size-3.5 shrink-0 ${
                                  isSelected
                                    ? "opacity-100 text-primary"
                                    : "opacity-0"
                                }`}
                              />
                            </div>
                          </CommandItem>
                        );
                      })}
                    </div>
                  </CommandGroup>

                  {/* Clear Filters when a specific category is active */}
                  {selectedCategory !== "all" && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedCategory("all");
                            setOpenCategory(false);
                          }}
                          className="justify-center text-xs text-muted-foreground cursor-pointer py-2 text-center"
                        >
                          Clear Filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
