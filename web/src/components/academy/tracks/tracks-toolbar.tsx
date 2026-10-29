"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";

interface TracksToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export function TracksToolbar({
  searchQuery,
  setSearchQuery,
  allTags,
  selectedTags,
  setSelectedTags,
}: TracksToolbarProps) {

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-b border-border/70 pb-6 sm:flex-row">
      {/* Search Bar */}
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          className="pl-9 pr-9 bg-card/50 border-border h-10"
          placeholder="Search language tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          
        />
      </div>

      <div className="flex w-full gap-2 flex-row items-center sm:w-auto sm:justify-end">
        {/* Tags Filter (Popover + Command) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 flex-1 sm:flex-none sm:w-32 flex items-center justify-between gap-2 overflow-hidden px-3 bg-card/40">
              <div className="flex items-center gap-3 truncate">
                <Filter className="h-4 w-4 shrink-0" />
                <span className="truncate">Filter</span>
              </div>
              {selectedTags.length > 0 && (
                <Badge variant="default" className="px-1.5 py-0 rounded-sm ml-1 shrink-0">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="ml-4 w-[320px] md:w-120 p-0" sideOffset={8}>
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup heading="Tags">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter((t) => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className="cursor-pointer flex items-center"
                        >
                          <Checkbox checked={isSelected} className="mr-2 pointer-events-none" />
                          <span className="truncate">{tag}</span>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
                {selectedTags.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setSelectedTags([])}
                        className="justify-center text-xs text-muted-foreground cursor-pointer"
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
  );
}
