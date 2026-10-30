export type VoteTargetType = 'project' | 'solution' | 'roadmap' | 'resource';

export interface VoteRecord {
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  voteType: number; // 1 for upvote/like, -1 for downvote
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetVoteStats {
  targetType: VoteTargetType;
  targetId: string;
  upvotes: number;
  downvotes: number;
  score: number; // upvotes - downvotes
  userVote: number | null; // 1, -1, or null
}

export interface ToggleVoteResult {
  action: 'voted' | 'switched' | 'unvoted';
  userVote: number | null;
  upvotes: number;
  downvotes: number;
  score: number;
}
