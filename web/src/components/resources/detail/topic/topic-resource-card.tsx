"use client";

import React from "react";
import { ExternalLink, Compass, ArrowRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicResourceItem } from "@/types/resource";
import { useTopicResourceCard } from "./hooks";

interface TopicResourceCardProps {
  item: TopicResourceItem;
  index?: number;
}

export function TopicResourceCard({ item, index }: TopicResourceCardProps) {
  const {
    ytId,
    domain,
    isInternal,
    tone,
    imgError,
    faviconUrl,
    youtubeThumbnailUrl,
    onImgError,
  } = useTopicResourceCard(item, index);

  return (
    <a
      href={item.url}
      target={isInternal ? "_self" : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      className={cn(
        "group flex flex-col rounded-lg border bg-card transition-all duration-300 hover:ring-1 overflow-hidden",
        tone.chipBorder,
        tone.ring
      )}
    >
      {ytId && youtubeThumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden p-2">
          <img
            src={youtubeThumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover rounded-sm"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
          {isInternal ? (
            <Compass className={cn("w-4 h-4", tone.accent)} />
          ) : !imgError ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4 object-contain"
              onError={onImgError}
            />
          ) : (
            <Globe className={cn("w-4 h-4", tone.accent)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-foreground transition-colors line-clamp-2 leading-snug",
              tone.hoverAccent
            )}
          >
            {item.title}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
            {isInternal ? "Roadmap" : domain}
          </p>
        </div>

        {isInternal ? (
          <ArrowRight
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 shrink-0",
              tone.hoverAccent
            )}
          />
        ) : (
          <ExternalLink
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-colors shrink-0",
              tone.hoverAccent
            )}
          />
        )}
      </div>
    </a>
  );
}

export default TopicResourceCard;
