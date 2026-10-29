import { BaseController } from "../base.controller";
import type { IVoteService } from "../../services/votes/vote.service";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type { VoteParamsInput, ToggleVoteInput } from "../../validators/vote.validator";
import type { ICradle } from "../../libs/awilix-container";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";

export class VoteController extends BaseController {
  private readonly voteService: IVoteService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.voteService = cradle.voteService;
  }

  /**
   * POST /votes/:targetType/:targetId
   * Authenticated toggle vote (like/unlike, upvote/downvote)
   */
  async toggleVote(req: ControllerRequest<ToggleVoteInput, VoteParamsInput>) {
    const { targetType, targetId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw AppError.unauthorized("Authentication required to vote");
    }

    const voteType = req.body?.voteType ?? 1;
    const data = await this.voteService.toggleVote(userId, targetType, targetId, voteType);
    return ApiResponse.success(data);
  }

  /**
   * GET /votes/:targetType/:targetId
   * Public or authenticated status check for an entity
   */
  async getVoteStatus(req: ControllerRequest<never, VoteParamsInput>) {
    const { targetType, targetId } = req.params;
    const userId = req.user?.id;

    const data = await this.voteService.getTargetVoteStats(targetType, targetId, userId);
    return ApiResponse.success(data);
  }
}
