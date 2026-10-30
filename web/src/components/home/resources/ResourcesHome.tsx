import React from "react";
import { ResourcesHomeSection } from "./ResourcesHomeSection";
import { ResourcesRoadmapDemo } from "./ResourcesRoadmapDemo";

interface ResourcesHomeProps {
  className?: string;
}

export function ResourcesHome({ className = "" }: ResourcesHomeProps) {
  return (
    <div
      id="resources-home"
      className={`flex flex-col gap-10 py-20 sm:pt-28 sm:pb-36 border-b overflow-hidden bg-background ${className}`}
    >
      {/* Centered Resources Header (matching SystemdesignHome pattern) */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Resources
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
          Visual, step-by-step career and skill paths across Web Development, AI/ML, DevOps, and more. <br className="hidden sm:block" />
          Navigate comprehensive learning trees with linked guides, best practices, and hands-on practice.
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-0 relative z-10 flex flex-col items-center gap-6">
        {/* ROW 1: Left: ResourcesHeader (Hexagons + Text) | Right: Resource Page Demo UI */}
        <ResourcesHomeSection />

        {/* ROW 2: Interactive Roadmap Vector Canvas Preview Demo */}
        <ResourcesRoadmapDemo />
      </div>
    </div>
  );
}

export default ResourcesHome;
