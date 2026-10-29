import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Wrench, Code2, Tag, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectMeta({ project }: { project: RoadmapProjectItem }) {
  const roadmaps = project.roadmapIds || [];
  const topics = project.topics || [];
  const skills = project.skills || [];
  const techStack = project.content?.suggestedTechStack || [];

  const hasAnyMeta =
    roadmaps.length > 0 ||
    topics.length > 0 ||
    skills.length > 0 ||
    techStack.length > 0;

  if (!hasAnyMeta) return null;

  return (
    <section className="pt-8 border-t-2 border-border/50 space-y-12">
      {/* 1. Relevant Roadmaps - Learning Path Callout */}
      {roadmaps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Compass className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Relevant Roadmaps
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {roadmaps.map((roadmapId) => (
              <Link
                key={roadmapId}
                id={`roadmap-link-${roadmapId}`}
                href={`/resources/${roadmapId}`}
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-border text-xs sm:text-sm font-medium text-primary transition-all duration-200 hover:underline"
              >
                <span className="capitalize font-semibold ">
                  {roadmapId.replace(/-/g, " ")} Roadmap
                </span>
                <Link2 className="size-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. Editorial Two-Column Grid: Skills & Topics on Left, Tech Stack on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Skills & Topics */}
        <div className="space-y-6">
          {skills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-primary shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  Skills You'll Practice
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    id={`project-meta-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                    variant="secondary"
                    className="font-medium text-xs px-2.5 py-1 rounded-md"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          
        </div>

        {/* Right Column: Suggested Tech Stack */}
        {techStack.length > 0 && (
          <div className="space-y-3 md:border-l md:border-border/60 md:pl-8">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                Suggested Tech Stack
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {techStack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  id={`project-meta-tech-${tech.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-2.5 py-1 rounded-md text-xs"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-primary shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  Topics
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Badge
                    key={topic}
                    id={`project-meta-topic-${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    variant="outline"
                    className="font-medium text-xs px-2.5 py-1 rounded-md"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
