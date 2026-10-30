export type VoteTargetType = "project" | "solution" | "roadmap" | "resource";

export interface TargetVoteStats {
  targetType: VoteTargetType;
  targetId: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null; // 1 (upvoted / liked), -1 (downvoted), or null
}

export interface ToggleVoteResult {
  action: "voted" | "switched" | "unvoted";
  userVote: number | null;
  upvotes: number;
  downvotes: number;
  score: number;
}

export interface ToggleVotePayload {
  voteType?: 1 | -1;
}
