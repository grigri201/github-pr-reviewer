import { Router } from "express";
import reviewController from "../controllers/reviewController";

const router = Router();

/**
 * 处理PR webhook事件
 * POST /api/review/webhook
 */
router.post(
  "/webhook",
  reviewController.handlePullRequest.bind(reviewController)
);

/**
 * 分析PR差异
 * GET /api/review/diff/:owner/:repo/:pull_number
 */
router.get(
  "/diff/:owner/:repo/:pull_number",
  reviewController.analyzePullRequestDiff.bind(reviewController)
);

export default router;
