"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Library, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoadmapResourceItem } from "@/types/roadmap-resource";

export interface ResourceSubmittedViewProps {
  resource: Partial<RoadmapResourceItem> & { title: string };
  mode?: "create" | "update";
  onReset?: () => void;
}

export function ResourceSubmittedView({
  resource,
  mode = "create",
  onReset,
}: ResourceSubmittedViewProps) {
  const isUpdate = mode === "update";
  const firstRoadmap = resource.roadmapIds?.[0];

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center max-w-lg mx-auto px-4 py-8 text-center animate-in fade-in-50 duration-200">
      <div className="size-14 rounded-full text-primary border border-primary/20 flex items-center justify-center mx-auto mb-2">
        <CheckCircle2 className="size-8 text-difficulty-easy" />
      </div>

      <h1
        id="submitted-resource-heading"
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3"
      >
        {isUpdate ? "Changes Saved" : "Resource Submitted"}
      </h1>

      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
        {isUpdate ? (
          <>
            Your changes to{" "}
            <span className="font-semibold text-primary">
              &ldquo;{resource.title}&rdquo;
            </span>{" "}
            have been saved and will appear publicly once approved by admins.
          </>
        ) : (
          <>
            Your resource{" "}
            <span className="font-semibold text-primary">
              &ldquo;{resource.title}&rdquo;
            </span>{" "}
            has been submitted and will appear publicly once approved by admins.
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {resource.url && (
          <Button
            id="preview-submitted-resource-btn"
            asChild
            size="default"
            className="cursor-pointer"
          >
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              <span>Open Link</span>
            </a>
          </Button>
        )}

        <Button
          id="explore-resources-btn"
          asChild
          variant="outline"
          size="default"
          className="cursor-pointer"
        >
          <Link
            href={
              firstRoadmap
                ? `/resources/${firstRoadmap}?tab=resources`
                : "/resources"
            }
          >
            <Library className="size-4" />
            <span>{firstRoadmap ? "Back to Resources" : "All Roadmaps"}</span>
          </Link>
        </Button>

        {!isUpdate && onReset && (
          <Button
            id="submit-another-resource-btn"
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
