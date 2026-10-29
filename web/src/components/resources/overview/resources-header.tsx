"use client";

import type { RoadmapSummary } from "@/types/resource";
import Link from "next/link";
import { RoadmapIcon } from "../shared/roadmap-icon";

interface ResourcesHeaderProps {
  totalRoadmaps: number;
  sampleRoadmaps: RoadmapSummary[];
  as?: "h1" | "h2";
}

export function ResourcesHeader({
  totalRoadmaps,
  sampleRoadmaps,
  as = "h1",
}: ResourcesHeaderProps) {
  const Heading = as;

  return (
    <section className="flex flex-col items-center justify-center text-center space-y-8">
      {/* Overlapping Hexagon Icons along an arc curve */}
      {sampleRoadmaps.length > 0 && (
        <div className="flex items-center justify-center -space-x-5 sm:-space-x-6">
          {sampleRoadmaps.slice(0, 8).map((roadmap, i) => {
            const title =
              roadmap.title?.card || roadmap.title?.page || roadmap.slug;
            return (
              <Link
                id={`header-roadmap-${roadmap.slug}`}
                href={`/resources/${roadmap.slug}`}
                key={roadmap.id || roadmap.slug}
                className="relative transition-transform cursor-pointer"
                style={{
                  zIndex: 10 - Math.floor(Math.abs(3.5 - i)),
                  transform: `translateY(${Math.pow(i - 3.5, 2) * 2.5}px)`,
                }}
                aria-label={title}
                title={title}
              >
                <RoadmapIcon
                  slug={roadmap.slug}
                  category={roadmap.category}
                  name={title}
                  index={i}
                />
              </Link>
            );
          })}
        </div>
      )}

      {/* Typography */}
      <div className="space-y-4 max-w-3xl flex flex-col items-center">
        <Heading className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          <span className="text-primary">{totalRoadmaps} roadmaps</span> for you to master
        </Heading>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Visual, step-by-step career and skill paths across Web Development, AI/ML,
          System Design, DevOps, and more. 100% free and community-driven.
        </p>
      </div>
    </section>
  );
}
