import React from "react";
import { CheckSquare } from "lucide-react";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectChecklist({
  project,
}: {
  project: RoadmapProjectItem;
}) {
  const checklist = project.content?.checklist || [];
  if (checklist.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CheckSquare className="size-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Milestone Checklist
        </h2>
      </div>
      <ul className="space-y-2.5 list-disc list-outside pl-5 text-base text-foreground leading-relaxed">
        {checklist.map((item, idx) => (
          <li key={idx} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
