import { db, schema } from "../../db";
import { eq, and, sql, inArray } from "drizzle-orm";
import type { Vote } from "../../db/schema";
import type { VoteTargetType } from "../../types/votes/vote.types";
import type { ICradle } from "../../libs/awilix-container";
import type { IClockService } from "../../services/common/clock.service";

export interface IVoteRepository {
  getUserVote(userId: string, targetType: VoteTargetType, targetId: string): Promise<Vote | null>;
  getUserVotesForTargets(userId: string, targetType: VoteTargetType, targetIds: string[]): Promise<Record<string, number>>;
  upsertVote(userId: string, targetType: VoteTargetType, targetId: string, voteType: number): Promise<Vote>;
  deleteVote(userId: string, targetType: VoteTargetType, targetId: string): Promise<boolean>;
  getVoteCounts(targetType: VoteTargetType, targetId: string): Promise<{ upvotes: number; downvotes: number }>;
  deleteVotesForTarget(targetType: VoteTargetType, targetId: string): Promise<void>;
}

export class VoteRepository implements IVoteRepository {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  async getUserVote(userId: string, targetType: VoteTargetType, targetId: string): Promise<Vote | null> {
    const [vote] = await db
      .select()
      .from(schema.votes)
      .where(
        and(
          eq(schema.votes.userId, userId),
          eq(schema.votes.targetType, targetType),
          eq(schema.votes.targetId, targetId)
        )
      )
      .limit(1);

    return vote ?? null;
  }

  async getUserVotesForTargets(
    userId: string,
    targetType: VoteTargetType,
    targetIds: string[]
  ): Promise<Record<string, number>> {
    if (!targetIds.length) return {};

    const results = await db
      .select({
        targetId: schema.votes.targetId,
        voteType: schema.votes.voteType,
      })
      .from(schema.votes)
      .where(
        and(
          eq(schema.votes.userId, userId),
          eq(schema.votes.targetType, targetType),
          inArray(schema.votes.targetId, targetIds)
        )
      );

    const voteMap: Record<string, number> = {};
    for (const r of results) {
      voteMap[r.targetId] = r.voteType;
    }
    return voteMap;
  }

  async upsertVote(
    userId: string,
    targetType: VoteTargetType,
    targetId: string,
    voteType: number
  ): Promise<Vote> {
    const [vote] = await db
      .insert(schema.votes)
      .values({
        userId,
        targetType,
        targetId,
        voteType,
        createdAt: this.clock.nowDate(),
        updatedAt: this.clock.nowDate(),
      })
      .onConflictDoUpdate({
        target: [schema.votes.userId, schema.votes.targetType, schema.votes.targetId],
        set: {
          voteType,
          updatedAt: this.clock.nowDate(),
        },
      })
      .returning();

    return vote;
  }

  async deleteVote(userId: string, targetType: VoteTargetType, targetId: string): Promise<boolean> {
    const result = await db
      .delete(schema.votes)
      .where(
        and(
          eq(schema.votes.userId, userId),
          eq(schema.votes.targetType, targetType),
          eq(schema.votes.targetId, targetId)
        )
      )
      .returning();

    return result.length > 0;
  }

  async getVoteCounts(
    targetType: VoteTargetType,
    targetId: string
  ): Promise<{ upvotes: number; downvotes: number }> {
    const rows = await db
      .select({
        voteType: schema.votes.voteType,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.votes)
      .where(
        and(
          eq(schema.votes.targetType, targetType),
          eq(schema.votes.targetId, targetId)
        )
      )
      .groupBy(schema.votes.voteType);

    let upvotes = 0;
    let downvotes = 0;

    for (const row of rows) {
      if (row.voteType === 1) upvotes = Number(row.count);
      if (row.voteType === -1) downvotes = Number(row.count);
    }

    return { upvotes, downvotes };
  }

  async deleteVotesForTarget(targetType: VoteTargetType, targetId: string): Promise<void> {
    await db
      .delete(schema.votes)
      .where(
        and(
          eq(schema.votes.targetType, targetType),
          eq(schema.votes.targetId, targetId)
        )
      );
  }
}
