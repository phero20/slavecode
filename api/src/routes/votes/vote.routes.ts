import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { voteParamSchema, toggleVoteSchema } from "../../validators/vote.validator";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import type { VoteController } from "../../controllers/votes/vote.controller";
import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";

export const registerVoteRoutes = (
  app: Hono<AppEnv>,
  {
    voteController,
    authMiddleware,
  }: {
    voteController: VoteController;
    authMiddleware: AuthMiddleware;
  },
) => {
  const votes = new Hono<AppEnv>();

  // POST /votes/:targetType/:targetId - Toggle vote (1 = upvote/like, -1 = downvote)
  votes.post(
    "/:targetType/:targetId",
    authMiddleware.handle.bind(authMiddleware),
    zValidator("param", voteParamSchema),
    zValidator("json", toggleVoteSchema),
    voteController.action(voteController.toggleVote, { requireAuth: true })
  );

  // GET /votes/:targetType/:targetId - Get vote stats & user status (optional auth)
  votes.get(
    "/:targetType/:targetId",
    authMiddleware.handle.bind(authMiddleware),
    zValidator("param", voteParamSchema),
    voteController.action(voteController.getVoteStatus, { requireAuth: false })
  );

  app.route("/votes", votes);
};
