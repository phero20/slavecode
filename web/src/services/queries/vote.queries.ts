import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { TargetVoteStats, VoteTargetType } from "@/types/vote";

/**
 * Fetch vote counts, score, and current user vote status for an entity.
 */
export async function getVoteStatus(
  targetType: VoteTargetType,
  targetId: string
): Promise<TargetVoteStats> {
  const response = await apiClient.get<ApiResponse<TargetVoteStats>>(
    `/votes/${targetType}/${targetId}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch vote status");
  }

  return response.data.data;
}
