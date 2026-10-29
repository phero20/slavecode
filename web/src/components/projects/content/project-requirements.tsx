import React from "react";
import { ClipboardList } from "lucide-react";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectRequirements({
  project,
}: {
  project: RoadmapProjectItem;
}) {
  const requirements = project.content?.requirements || [];
  if (requirements.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ClipboardList className="size-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Requirements
        </h2>
      </div>
      <ol className="space-y-2.5 list-decimal list-outside pl-5 text-base text-foreground leading-relaxed">
        {requirements.map((req, idx) => (
          <li key={idx} className="pl-1">
            {req}
          </li>
        ))}
      </ol>
    </section>
  );
}
