"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RoadmapProjectItem } from "@/types/project";

export function ProjectMedia({ project }: { project: RoadmapProjectItem }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const previewImage = project.content?.previewImage;
  if (!previewImage || imageError) {
    return null;
  }

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border/60 bg-muted/20">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
          <Image
            src="/logos/android-chrome-192x192.png"
            alt="Loading"
            width={44}
            height={44}
            className="object-contain opacity-60 animate-pulse"
          />
        </div>
      )}
      <Image
        src={previewImage}
        alt={project.title}
        fill
        sizes="(max-width: 1024px) 100vw, 896px"
        className={cn(
          "object-cover transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
