import { z } from 'zod';

export const voteParamSchema = z.object({
  targetType: z.enum(['project', 'solution', 'roadmap']),
  targetId: z.string().min(1, "targetId is required"),
});

export const toggleVoteSchema = z.object({
  voteType: z
    .number()
    .refine((v) => v === 1 || v === -1, {
      message: "voteType must be 1 (upvote/like) or -1 (downvote)",
    })
    .default(1),
});

export type VoteParamsInput = z.infer<typeof voteParamSchema>;
export type ToggleVoteInput = z.infer<typeof toggleVoteSchema>;
