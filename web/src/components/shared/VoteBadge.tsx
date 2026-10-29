"use client";

import React from "react";
import { ThumbsUp, ThumbsDown, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useVoteStatus } from "@/hooks/queries/use-vote.queries";
import type { VoteTargetType } from "@/types/vote";
import { cn } from "@/lib/utils";

export interface VoteBadgeProps {
  targetType: VoteTargetType;
  targetId: string;
  /** Initial or fallback score before query resolves (e.g. upvotes - downvotes) */
  fallbackScore?: number;
  /** Icon style to use: thumbs (default) or arrow (Reddit/StackOverflow style) */
  icon?: "thumbs" | "arrow";
  /** Layout orientation: vertical (count on top, label below) or horizontal */
  orientation?: "vertical" | "horizontal";
  /** Whether to show the "Votes" label */
  showLabel?: boolean;
  /** Custom label text (defaults to "Votes") */
  labelText?: string;
  className?: string;
}

function formatScore(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (Math.abs(n) >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return n.toString();
}

/**
 * Shareable read-only vote badge that displays live real score (`upvotes - downvotes`)
 * with smooth fallback and live cache synchronization with VoteControl.
 */
export function VoteBadge({
  targetType,
  targetId,
  fallbackScore = 0,
  icon = "thumbs",
  orientation = "vertical",
  showLabel = true,
  labelText = "Votes",
  className,
}: VoteBadgeProps) {
  const { data: stats } = useVoteStatus(targetType, targetId);

  // Real score = upvotes - downvotes
  const score = stats?.score ?? fallbackScore;
  const userVote = stats?.userVote ?? null;

  const isPositive = score > 0;
  const isNegative = score < 0;

  // Select appropriate icon
  const renderIcon = () => {
    if (icon === "arrow") {
      if (isNegative) {
        return (
          <ArrowBigDown
            className={cn(
              "size-4 shrink-0 transition-all",
              userVote === -1 ? "fill-destructive text-destructive" : "text-destructive"
            )}
          />
        );
      }
      return (
        <ArrowBigUp
          className={cn(
            "size-4 shrink-0 transition-all",
            userVote === 1
              ? "fill-primary text-primary"
              : isPositive
              ? "text-primary"
              : "text-muted-foreground/70"
          )}
        />
      );
    }

    // Default: "thumbs"
    if (isNegative) {
      return (
        <ThumbsDown
          className={cn(
            "size-3.5 shrink-0 transition-all",
            userVote === -1 ? "fill-destructive text-destructive" : "text-destructive"
          )}
        />
      );
    }

    return (
      <ThumbsUp
        className={cn(
          "size-3.5 shrink-0 transition-all",
          userVote === 1
            ? "fill-primary text-primary"
            : isPositive
            ? "text-primary"
            : "text-muted-foreground/70"
        )}
      />
    );
  };

  const textColorClass = isNegative
    ? "text-destructive"
    : isPositive
    ? "text-primary"
    : "text-muted-foreground";

  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors select-none",
          className
        )}
      >
        {renderIcon()}
        <span className={cn("text-xs font-black tabular-nums", textColorClass)}>
          {formatScore(score)}
        </span>
        {showLabel && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
            {labelText}
          </span>
        )}
      </div>
    );
  }

  // Default: vertical orientation (exact match for list cover items)
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-1 select-none",
        className
      )}
    >
      <div className={cn("flex items-center gap-1.5 transition-colors", textColorClass)}>
        {renderIcon()}
        <span className="text-xs font-black tabular-nums">
          {formatScore(score)}
        </span>
      </div>
      {showLabel && (
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">
          {labelText}
        </span>
      )}
    </div>
  );
}
