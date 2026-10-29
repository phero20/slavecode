import React from "react";
import { BookOpen } from "lucide-react";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectOverview({ project }: { project: RoadmapProjectItem }) {
  const overview = project.content?.overview;
  if (!overview) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <BookOpen className="size-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          About this Project
        </h2>
      </div>
      <p className="text-base sm:text-[17px] text-muted-foreground leading-relaxed whitespace-pre-line">
        {overview}
      </p>
    </section>
  );
}
