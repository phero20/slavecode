"use client";

import { useQuery } from "@tanstack/react-query";
import { getVoteStatus } from "@/services/queries/vote.queries";
import type { VoteTargetType, TargetVoteStats } from "@/types/vote";

export const voteKeys = {
  all: ["votes"] as const,
  target: (targetType: VoteTargetType, targetId: string) =>
    [...voteKeys.all, targetType, targetId] as const,
};

interface UseVoteStatusOptions {
  enabled?: boolean;
  initialData?: TargetVoteStats;
}

/**
 * Hook to fetch the vote status and counts for any target entity.
 */
export function useVoteStatus(
  targetType: VoteTargetType,
  targetId: string,
  options?: UseVoteStatusOptions
) {
  return useQuery({
    queryKey: voteKeys.target(targetType, targetId),
    queryFn: () => getVoteStatus(targetType, targetId),
    enabled: Boolean(targetId) && (options?.enabled ?? true),
    initialData: options?.initialData,
    staleTime: 1000 * 30,
  });
}
