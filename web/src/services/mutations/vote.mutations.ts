import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ToggleVotePayload, ToggleVoteResult, VoteTargetType } from "@/types/vote";

/**
 * Toggle a vote (like/unlike, upvote/downvote) on an entity.
 */
export async function toggleVote(
  targetType: VoteTargetType,
  targetId: string,
  payload?: ToggleVotePayload
): Promise<ToggleVoteResult> {
  const response = await apiClient.post<ApiResponse<ToggleVoteResult>>(
    `/votes/${targetType}/${targetId}`,
    payload ?? { voteType: 1 }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to toggle vote");
  }

  return response.data.data;
}
