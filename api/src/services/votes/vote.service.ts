import type { IVoteRepository } from "../../repositories/votes/vote.repository";
import type {
  VoteTargetType,
  ToggleVoteResult,
  TargetVoteStats,
} from "../../types/votes/vote.types";
import type { ICradle } from "../../libs/awilix-container";
import { RoadmapProjectModel } from "../../mongo/models/roadmap-project.model";
import { db, schema } from "../../db";
import { eq } from "drizzle-orm";
import { redis } from "../../libs/core/redis";

export interface IVoteService {
  toggleVote(
    userId: string,
    targetType: VoteTargetType,
    targetId: string,
    voteType?: number,
  ): Promise<ToggleVoteResult>;
  getUserVote(
    userId: string,
    targetType: VoteTargetType,
    targetId: string,
  ): Promise<number | null>;
  getUserVotesMap(
    userId: string,
    targetType: VoteTargetType,
    targetIds: string[],
  ): Promise<Record<string, number>>;
  getTargetVoteStats(
    targetType: VoteTargetType,
    targetId: string,
    userId?: string,
  ): Promise<TargetVoteStats>;
}

export class VoteService implements IVoteService {
  private readonly voteRepository: IVoteRepository;

  constructor({ voteRepository }: ICradle) {
    this.voteRepository = voteRepository;
  }

  async toggleVote(
    userId: string,
    targetType: VoteTargetType,
    targetId: string,
    voteType: number = 1,
  ): Promise<ToggleVoteResult> {
    const existingVote = await this.voteRepository.getUserVote(
      userId,
      targetType,
      targetId,
    );

    let action: "voted" | "switched" | "unvoted";
    let userVote: number | null = null;

    if (existingVote && existingVote.voteType === voteType) {
      // User tapped the same button again: toggle off / un-vote
      await this.voteRepository.deleteVote(userId, targetType, targetId);
      action = "unvoted";
      userVote = null;
    } else if (existingVote) {
      // User switched from e.g. downvote to upvote (or vice-versa)
      await this.voteRepository.upsertVote(
        userId,
        targetType,
        targetId,
        voteType,
      );
      action = "switched";
      userVote = voteType;
    } else {
      // First-time vote
      await this.voteRepository.upsertVote(
        userId,
        targetType,
        targetId,
        voteType,
      );
      action = "voted";
      userVote = voteType;
    }

    const { upvotes, downvotes } = await this.voteRepository.getVoteCounts(
      targetType,
      targetId,
    );

    // Sync count to MongoDB RoadmapProject when voting on a project (net score supports negative values)
    if (targetType === "project") {
      RoadmapProjectModel.updateOne(
        { slug: targetId },
        { $set: { "stats.upvotesCount": upvotes - downvotes } }
      ).exec().catch(() => {});

      // Invalidate the detail cache for this project so fresh stats are retrieved
      try {
        redis.del(`projects:detail:${targetId.toLowerCase().trim()}`).catch(() => {});
      } catch {
        // non-blocking
      }
    }

    // Sync count to PostgreSQL solutions when voting on a solution and invalidate cache
    if (targetType === "solution") {
      db.update(schema.solutions)
        .set({ upvotes, downvotes })
        .where(eq(schema.solutions.id, targetId))
        .returning({ problemId: schema.solutions.problemId, userId: schema.solutions.userId })
        .then(([updated]) => {
          if (updated) {
            redis.del(`problem:solutions:${updated.problemId}`).catch(() => {});
            if (updated.userId) {
              redis.del(`user:solutions:recent:${updated.userId}`).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }

    return {
      action,
      userVote,
      upvotes,
      downvotes,
      score: upvotes - downvotes,
    };
  }

  async getUserVote(
    userId: string,
    targetType: VoteTargetType,
    targetId: string,
  ): Promise<number | null> {
    const vote = await this.voteRepository.getUserVote(
      userId,
      targetType,
      targetId,
    );
    return vote ? vote.voteType : null;
  }

  async getUserVotesMap(
    userId: string,
    targetType: VoteTargetType,
    targetIds: string[],
  ): Promise<Record<string, number>> {
    return await this.voteRepository.getUserVotesForTargets(
      userId,
      targetType,
      targetIds,
    );
  }

  async getTargetVoteStats(
    targetType: VoteTargetType,
    targetId: string,
    userId?: string,
  ): Promise<TargetVoteStats> {
    const countsPromise = this.voteRepository.getVoteCounts(
      targetType,
      targetId,
    );
    const userVotePromise = userId
      ? this.voteRepository.getUserVote(userId, targetType, targetId)
      : Promise.resolve(null);

    const [counts, userVoteRecord] = await Promise.all([
      countsPromise,
      userVotePromise,
    ]);

    return {
      targetType,
      targetId,
      upvotes: counts.upvotes,
      downvotes: counts.downvotes,
      score: counts.upvotes - counts.downvotes,
      userVote: userVoteRecord ? userVoteRecord.voteType : null,
    };
  }
}
