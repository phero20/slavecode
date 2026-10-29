"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toggleVote } from "@/services/mutations/vote.mutations";
import { voteKeys } from "../queries/use-vote.queries";
import type {
  VoteTargetType,
  TargetVoteStats,
  ToggleVotePayload,
  ToggleVoteResult,
} from "@/types/vote";
import { toast } from "sonner";

interface UseToggleVoteOptions {
  onSuccess?: (result: ToggleVoteResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to toggle votes (likes/upvotes/downvotes) with instant optimistic UI updates
 * and automatic Clerk authentication prompt for unauthenticated users.
 */
export function useToggleVote(
  targetType: VoteTargetType,
  targetId: string,
  options?: UseToggleVoteOptions,
) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  return useMutation<
    ToggleVoteResult,
    Error,
    ToggleVotePayload | undefined,
    { previous?: TargetVoteStats }
  >({
    mutationFn: async (payload?: ToggleVotePayload) => {
      if (!isSignedIn) {
        openSignIn();
        throw new Error("Authentication required");
      }
      return await toggleVote(targetType, targetId, payload);
    },

    onMutate: async (payload) => {
      // 1. Cancel outgoing queries for this entity
      const queryKey = voteKeys.target(targetType, targetId);
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot previous value
      const previous = queryClient.getQueryData<TargetVoteStats>(queryKey);

      // 3. Compute optimistic next state
      const targetVoteType = payload?.voteType ?? 1;
      const currentVote = previous?.userVote ?? null;

      let optimisticUserVote: number | null = null;
      let upvotes = previous?.upvotes ?? 0;
      let downvotes = previous?.downvotes ?? 0;

      if (currentVote === targetVoteType) {
        // Toggle off (un-vote)
        optimisticUserVote = null;
        if (targetVoteType === 1) upvotes = Math.max(0, upvotes - 1);
        if (targetVoteType === -1) downvotes = Math.max(0, downvotes - 1);
      } else if (currentVote !== null) {
        // Switched vote
        optimisticUserVote = targetVoteType;
        if (targetVoteType === 1) {
          upvotes += 1;
          downvotes = Math.max(0, downvotes - 1);
        } else {
          downvotes += 1;
          upvotes = Math.max(0, upvotes - 1);
        }
      } else {
        // Brand new vote
        optimisticUserVote = targetVoteType;
        if (targetVoteType === 1) upvotes += 1;
        if (targetVoteType === -1) downvotes += 1;
      }

      // 4. Optimistically update the cache
      queryClient.setQueryData<TargetVoteStats>(queryKey, {
        targetType,
        targetId,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        userVote: optimisticUserVote,
      });

      return { previous };
    },

    onError: (error, _payload, context) => {
      // Rollback to previous state on failure
      if (context?.previous) {
        queryClient.setQueryData(
          voteKeys.target(targetType, targetId),
          context.previous,
        );
      }
      if (error.message !== "Authentication required") {
        toast.error(error.message || "Failed to update vote");
      }
      options?.onError?.(error);
    },

    onSuccess: (data) => {
      // Update cache with server-verified state
      queryClient.setQueryData<TargetVoteStats>(
        voteKeys.target(targetType, targetId),
        {
          targetType,
          targetId,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          score: data.score,
          userVote: data.userVote,
        },
      );
      options?.onSuccess?.(data);
    },

    onSettled: () => {
      // Re-validate cache to ensure 100% data sync
      queryClient.invalidateQueries({
        queryKey: voteKeys.target(targetType, targetId),
      });
    },
  });
}
