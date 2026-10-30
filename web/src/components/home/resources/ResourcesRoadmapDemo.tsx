"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapCanvas } from "@/components/resources/detail/canvas/RoadmapCanvas";
import type { RoadmapDetail } from "@/types/resource";
import fullStackRaw from "./full-stack.json";

const fullStackRoadmap = (fullStackRaw as unknown as { data: RoadmapDetail }).data;

export const ResourcesRoadmapDemo = () => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Roadmap Canvas Viewport: Compact on mobile, expansive on tablet/desktop */}
      <div
        id="home-roadmap-canvas-section"
        className="relative w-full overflow-hidden flex flex-col items-center h-[460px] sm:h-[860px] lg:h-[940px] pt-4"
      >
        {/* Full Mode Vector Roadmap Canvas */}
        <div className="w-full max-w-7xl flex justify-center pointer-events-none opacity-95">
          <RoadmapCanvas roadmap={fullStackRoadmap} />
        </div>

        {/* Bottom Fade Overlay to create the "more items below" illusion */}
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-88 bg-linear-to-t from-background via-background/70 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Consistent Text & Link CTA Button placed to overlap the fade */}
      <div className="flex flex-col items-center justify-center text-center relative z-20 -mt-12 sm:-mt-20 gap-3 pb-4">
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl px-4">
          Explore the complete step-by-step full-stack roadmap with all interactive topics, guides, and projects.
        </p>
        <Button
          id="home-fullstack-roadmap-cta-btn"
          variant="link"
          className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
          asChild
        >
          <Link href={`/resources/${fullStackRoadmap.slug}`}>
            View full roadmap <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResourcesRoadmapDemo;
