"use client";

import React from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { useVoteStatus } from "@/hooks/queries/use-vote.queries";
import { useToggleVote } from "@/hooks/mutations/use-vote.mutations";
import type { VoteTargetType } from "@/types/vote";
import { cn } from "@/lib/utils";

export interface VoteControlProps {
  targetType: VoteTargetType;
  targetId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  orientation?: "horizontal" | "vertical";
  showCount?: boolean;
  disabled?: boolean;
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
 * Reddit-style combined vote control built with shadcn Button and ButtonGroup.
 * Self-contained: automatically handles querying, optimistic voting,
 * and Clerk authentication modals for unauthenticated users.
 */
export function VoteControl({
  targetType,
  targetId,
  className,
  size = "default",
  orientation = "horizontal",
  showCount = true,
  disabled = false,
}: VoteControlProps) {
  const { data: stats, isLoading } = useVoteStatus(targetType, targetId);
  const toggleVoteMutation = useToggleVote(targetType, targetId);

  const userVote = stats?.userVote ?? null;
  const score = stats?.score ?? 0;

  const handleVote = (type: 1 | -1) => {
    if (disabled || !targetId) return;
    toggleVoteMutation.mutate({ voteType: type });
  };

  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "h-7 px-1.5 py-0",
      text: "h-7 px-2 text-xs",
      icon: "size-3.5",
    },
    default: {
      button: "h-8 px-2 py-0",
      text: "h-8 px-2.5 text-xs sm:text-sm",
      icon: "size-4",
    },
    lg: {
      button: "h-9 px-2.5 py-0",
      text: "h-9 px-3 text-sm sm:text-base",
      icon: "size-5",
    },
  }[size];

  return (
    <ButtonGroup
      id={`vote-control-${targetType}-${targetId}`}
      orientation={orientation}
      className={cn(
        "select-none shadow-none",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {/* Upvote Button */}
      <Button
        type="button"
        variant="outline"
        id={`vote-up-${targetType}-${targetId}`}
        aria-label="Upvote"
        title="Upvote"
        aria-pressed={isUpvoted}
        disabled={disabled || !targetId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(1);
        }}
        className={cn(
          "cursor-pointer transition-colors active:scale-95 bg-card/60 hover:bg-accent",
          sizeConfig.button,
          isUpvoted && "text-primary hover:text-primary"
        )}
      >
        <ArrowBigUp
          className={cn(
            sizeConfig.icon,
            "transition-transform",
            isUpvoted && "fill-current scale-105"
          )}
        />
      </Button>

      {/* Score Text */}
      {showCount && (
        <ButtonGroupText
          id={`vote-score-${targetType}-${targetId}`}
          className={cn(
            "tabular-nums text-center select-none font-bold bg-card/60 justify-center min-w-[1.75rem]",
            sizeConfig.text,
            isLoading && "opacity-40 animate-pulse",
            isUpvoted && "text-primary font-extrabold",
            isDownvoted && "text-destructive font-extrabold",
            !isUpvoted && !isDownvoted && "text-foreground font-semibold"
          )}
        >
          {isLoading && !stats ? "-" : formatScore(score)}
        </ButtonGroupText>
      )}

      {/* Downvote Button */}
      <Button
        type="button"
        variant="outline"
        id={`vote-down-${targetType}-${targetId}`}
        aria-label="Downvote"
        title="Downvote"
        aria-pressed={isDownvoted}
        disabled={disabled || !targetId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(-1);
        }}
        className={cn(
          "cursor-pointer transition-colors active:scale-95 bg-card/60 hover:bg-accent",
          sizeConfig.button,
          isDownvoted && "text-destructive hover:text-destructive"
        )}
      >
        <ArrowBigDown
          className={cn(
            sizeConfig.icon,
            "transition-transform",
            isDownvoted && "fill-current scale-105"
          )}
        />
      </Button>
    </ButtonGroup>
  );
}
