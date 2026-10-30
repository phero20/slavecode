"use client";

import React, { useState } from "react";
import { Compass, X, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useRoadmapsQuery } from "@/hooks/queries/use-resource.queries";

interface ResourceFormTaxonomyProps {
  roadmapIds: string[];
  toggleRoadmapId: (id: string) => void;
}

export function ResourceFormTaxonomy({
  roadmapIds,
  toggleRoadmapId,
}: ResourceFormTaxonomyProps) {
  const { data: roadmaps = [], isLoading: isLoadingRoadmaps } =
    useRoadmapsQuery();

  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Taxonomy & Categorization
          </h2>
          <p className="text-xs text-muted-foreground">
            Tag this resource with the career roadmaps it belongs to.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-medium text-foreground/90">
            Target Roadmaps <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground font-normal">
            {roadmapIds.length} selected
          </span>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="resource-roadmap-categories-trigger-btn"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full sm:w-[320px] justify-between text-xs sm:text-sm font-normal h-10 px-3"
            >
              <div className="flex items-center gap-2 truncate">
                <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {isLoadingRoadmaps
                    ? "Loading roadmaps..."
                    : roadmapIds.length === 0
                      ? "Select roadmaps..."
                      : `${roadmapIds.length} roadmap${roadmapIds.length > 1 ? "s" : ""} selected`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {roadmapIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] rounded-sm font-semibold"
                  >
                    {roadmapIds.length}
                  </Badge>
                )}
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[320px] md:w-120 p-0"
            sideOffset={6}
          >
            <Command>
              <CommandInput placeholder="Search roadmaps (e.g. Frontend, Docker, AI)..." />
              <CommandList className="max-h-70">
                <CommandEmpty>No matching roadmap found.</CommandEmpty>
                <CommandGroup heading="Available Roadmaps">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
                    {roadmaps.map((roadmap) => {
                      const isSelected = roadmapIds.includes(roadmap.slug);
                      const label =
                        roadmap.title?.card ||
                        roadmap.title?.page ||
                        roadmap.slug;
                      return (
                        <CommandItem
                          key={roadmap.slug}
                          value={`${label} ${roadmap.slug}`}
                          onSelect={() => toggleRoadmapId(roadmap.slug)}
                          className="cursor-pointer flex items-center justify-between text-sm py-2 px-2.5"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <span className="truncate">{label}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
                {roadmapIds.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          [...roadmapIds].forEach((id) => toggleRoadmapId(id));
                        }}
                        className="justify-center text-xs text-muted-foreground cursor-pointer hover:text-destructive py-2"
                      >
                        Clear Selected ({roadmapIds.length})
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {roadmapIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmapIds.map((id) => {
              const roadmap = roadmaps.find((r) => r.slug === id);
              const label =
                roadmap?.title?.card || roadmap?.title?.page || id;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="text-xs px-2.5 py-1 gap-1.5 font-normal bg-muted text-foreground border border-border"
                >
                  {label}
                  <button
                    id={`remove-resource-roadmap-${id}-btn`}
                    type="button"
                    onClick={() => toggleRoadmapId(id)}
                    className="hover:text-destructive transition-colors cursor-pointer"
                    aria-label={`Remove roadmap ${id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Select at least one career roadmap category (e.g., Frontend, Full Stack).
          </p>
        )}
      </div>
    </section>
  );
}
