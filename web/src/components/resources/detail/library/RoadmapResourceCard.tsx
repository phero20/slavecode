"use client";

import React, { memo } from "react";
import Image from "next/image";
import { ExternalLink, Globe } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteControl } from "@/components/shared/VoteControl";
import { ResourceOwnerActions } from "./ResourceOwnerActions";
import { useResourcePreview } from "./use-resource-preview";
import { cn } from "@/lib/utils";
import type { RoadmapResourceItem } from "@/types/roadmap-resource";

export interface RoadmapResourceCardProps {
  resource: RoadmapResourceItem;
  className?: string;
}

export const RoadmapResourceCard = memo(function RoadmapResourceCard({
  resource,
  className,
}: RoadmapResourceCardProps) {
  const {
    domain,
    faviconUrl,
    faviconError,
    setFaviconError,
    previewSrc,
    isImageLoading,
    onImageLoad,
    onImageError,
  } = useResourcePreview(resource.url, resource.thumbnailUrl);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(
        "button, a, [role='button'], [data-slot='button-group']"
      )
    ) {
      return;
    }
    window.open(resource.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      id={`resource-card-${resource.id}`}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden cursor-pointer h-full bg-card [content-visibility:auto] [contain-intrinsic-size:auto_340px] border-2 border-border/40 transition-colors duration-200 hover:border-primary/50",
        className
      )}
    >
      <div className="p-2 sm:p-2.5 pb-0 relative z-0 pointer-events-none">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border bg-muted/20 shrink-0">
          {isImageLoading && (
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
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={resource.title}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
                isImageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={onImageLoad}
              onError={onImageError}
              loading="lazy"
            />
          ) : !isImageLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 p-4">
              <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center p-2 mb-2">
                {faviconUrl && !faviconError ? (
                  <img
                    src={faviconUrl}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={() => setFaviconError(true)}
                    loading="lazy"
                  />
                ) : (
                  <Globe className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <span className="text-xs font-medium text-foreground font-mono truncate max-w-[85%]">
                {domain}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <CardHeader className="p-4 sm:p-5 pt-3.5 sm:pt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {resource.type && (
                <Badge
                  variant="outline"
                  className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                >
                  {resource.type}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground font-mono truncate">
                {domain}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {resource.id && (
                <VoteControl
                  targetType="resource"
                  targetId={resource.id}
                  size="sm"
                  className="shrink-0"
                />
              )}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {resource.title}
            </CardTitle>
            {resource.description ? (
              <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {resource.description}
              </CardDescription>
            ) : resource.author ? (
              <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {resource.author}
              </CardDescription>
            ) : null}
          </div>

          <ResourceOwnerActions resource={resource} />
        </div>
      </CardHeader>
    </Card>
  );
});
