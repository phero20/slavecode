"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Eye, FolderGit2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoadmapProjectItem } from "@/types/project";

export interface ProjectSubmittedViewProps {
  project: Partial<RoadmapProjectItem> & { slug: string; title: string };
  mode?: "create" | "update";
  onReset?: () => void;
}

export function ProjectSubmittedView({
  project,
  mode = "create",
  onReset,
}: ProjectSubmittedViewProps) {
  const isUpdate = mode === "update";

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center max-w-lg mx-auto px-4 py-8 text-center animate-in fade-in-50 duration-200">
      {/* Icon */}
      <div className="size-14 rounded-full text-primary border border-primary/20 flex items-center justify-center mx-auto mb-2">
        <CheckCircle2 className="size-8 text-difficulty-easy" />
      </div>

      {/* Heading */}
      <h1
        id="submitted-project-heading"
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3"
      >
        {isUpdate ? "Changes Saved" : "Project Submitted"}
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
        {isUpdate ? (
          <>
            Your changes to{" "}
            <span className="font-semibold text-primary">
              &ldquo;{project.title}&rdquo;
            </span>{" "}
            have been saved and will appear publicly once approved by admins.
          </>
        ) : (
          <>
            Your project{" "}
            <span className="font-semibold text-primary">
              &ldquo;{project.title}&rdquo;
            </span>{" "}
            has been submitted and will appear publicly once approved by admins.
          </>
        )}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          id="preview-submitted-project-btn"
          asChild
          size="default"
          className="cursor-pointer"
        >
          <Link href={`/projects/${project.slug}`}>
            <Eye className="size-4" />
            <span>Preview Project</span>
          </Link>
        </Button>

        <Button
          id="explore-projects-btn"
          asChild
          variant="outline"
          size="default"
          className="cursor-pointer"
        >
          <Link href="/projects">
            <FolderGit2 className="size-4" />
            <span>All Projects</span>
          </Link>
        </Button>

        {!isUpdate && onReset && (
          <Button
            id="submit-another-project-btn"
            variant="ghost"
            size="default"
            onClick={onReset}
            className="cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>Submit Another</span>
          </Button>
        )}
      </div>
    </div>
  );
}

