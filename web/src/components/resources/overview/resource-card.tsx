"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight } from "lucide-react";
import type { RoadmapSummary } from "@/types/resource";
import { RoadmapIcon } from "../shared/roadmap-icon";

interface ResourceCardProps {
  roadmap: RoadmapSummary;
  index?: number;
}

export function ResourceCard({ roadmap, index = 0 }: ResourceCardProps) {
  const title = roadmap.title?.card || roadmap.title?.page || roadmap.slug;

  // Replace @currentYear@ placeholders with current dynamic year
  const currentYear = new Date().getFullYear().toString();
  const description = (roadmap.description || "").replace(
    /@currentYear@/g,
    currentYear
  );

  return (
    <Link
      id={`roadmap-card-link-${roadmap.slug}`}
      href={`/resources/${roadmap.slug}`}
      prefetch={true}
      className="block focus:outline-none h-full"
    >
      <Card
        id={`roadmap-card-${roadmap.slug}`}
        className="group relative flex cursor-pointer flex-row items-start gap-4 sm:gap-5 overflow-hidden p-5 transition-all border-border bg-card duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 h-full"
      >
        {/* Left Icon Side (Matching Academy TrackCard Hexagon layout) */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center pt-0.5">
          <RoadmapIcon
            slug={roadmap.slug}
            category={roadmap.category}
            name={title}
            index={index}
            size="card"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Right Content Side */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {/* Title & Type Badge */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {roadmap.type && (
              <Badge
                variant="secondary"
                className="bg-secondary/60 text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider px-2 py-0.5 shrink-0"
              >
                {roadmap.type}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Footer Meta */}
          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span>{roadmap.nodesCount || 0} topics</span>
            </div>

            <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
