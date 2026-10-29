"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteControl } from "@/components/shared/VoteControl";
import { cn } from "@/lib/utils";
import type { RoadmapProjectItem, ProjectDifficulty } from "@/types/project";

export interface ProjectCardProps {
  project: RoadmapProjectItem;
  index?: number;
  className?: string;
  onClick?: (project: RoadmapProjectItem) => void;
}

export type RoadmapProjectCardProps = ProjectCardProps;

interface DifficultyStyle {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  hoverBorder: string;
  hoverText: string;
}

const DIFFICULTY_CONFIG: Record<ProjectDifficulty, DifficultyStyle> = {
  beginner: {
    badgeBg: "bg-difficulty-easy",
    badgeBorder: "border-difficulty-easy",
    badgeText: "text-difficulty-easy",
    hoverBorder: "hover:border-primary/50",
    hoverText: "group-hover:text-difficulty-easy",
  },
  intermediate: {
    badgeBg: "bg-difficulty-medium",
    badgeBorder: "border-difficulty-medium",
    badgeText: "text-difficulty-medium",
    hoverBorder: "hover:border-primary/50",
    hoverText: "group-hover:text-difficulty-medium",
  },
  advanced: {
    badgeBg: "bg-difficulty-hard",
    badgeBorder: "border-difficulty-hard",
    badgeText: "text-difficulty-hard",
    hoverBorder: "hover:border-primary/50",
    hoverText: "group-hover:text-difficulty-hard",
  },
};

export const ProjectCard = memo(function ProjectCard({
  project,
  className,
  onClick,
}: ProjectCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const difficultyConfig =
    DIFFICULTY_CONFIG[project.difficulty] || DIFFICULTY_CONFIG.beginner;

  const previewImage = project.content?.previewImage;
  const hasPreview = Boolean(previewImage && !imgError);

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is inside a button (e.g. VoteControl) or interactive link, do not navigate
    if ((e.target as HTMLElement).closest("button, [role='button'], [data-slot='button-group']")) {
      return;
    }
    if (onClick) {
      onClick(project);
    } else {
      router.push(`/projects/${project.slug}`);
    }
  };

  return (
    <Card
      id={`project-card-${project.slug}`}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden cursor-pointer h-full bg-card [content-visibility:auto] [contain-intrinsic-size:auto_340px] border-2 transition-colors duration-200",
        difficultyConfig.hoverBorder,
        className
      )}
    >

      {/* Top Preview Image Container with Inset Padding */}
      <div className="p-2 sm:p-2.5 pb-0 relative z-0 pointer-events-none">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border bg-muted/20 shrink-0">
          {hasPreview ? (
            <>
              {/* Blinking Logo Placeholder while image is loading */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
                  <Image
                    src="/logos/android-chrome-192x192.png"
                    alt="Loading"
                    width={40}
                    height={40}
                    className="object-contain opacity-70 animate-pulse"
                  />
                </div>
              )}

              <Image
                src={previewImage!}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-opacity duration-200",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setImgError(true);
                }}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <Image
                src="/logos/android-chrome-192x192.png"
                alt="SlaveCode"
                width={44}
                height={44}
                className="object-contain opacity-70"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Area Below Image */}
      <CardHeader className="p-4 sm:p-5 pt-3.5 sm:pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Difficulty Badge + Category Pill (Left) & Reddit-style Vote Control (Right) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                  difficultyConfig.badgeBg,
                  difficultyConfig.badgeBorder,
                  difficultyConfig.badgeText
                )}
              >
                {project.difficulty}
              </Badge>

              {/* {project.topics && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-normal text-muted-foreground border-border/60 capitalize"
                >
                  {project.topics}
                </Badge>
              )} */}
            </div>

            <VoteControl
              targetType="project"
              targetId={project.slug}
              size="sm"
              className="shrink-0"
            />
          </div>

          {/* Project Title & Description */}
          <div className="space-y-1">
            <CardTitle
              className={cn(
                "text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-1",
                difficultyConfig.hoverText
              )}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="hover:underline focus:outline-none"
              >
                {project.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

export const RoadmapProjectCard = ProjectCard;

