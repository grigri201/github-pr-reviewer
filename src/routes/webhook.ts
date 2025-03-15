import { Router, Request, Response } from "express";
import { PullRequestController } from "../controllers/pullRequest";
import { webhookVerification } from "../middleware/webhook";

/**
 * 创建 webhook 路由
 * @param githubToken GitHub API 令牌
 * @param webhookSecret Webhook 密钥
 * @returns Express 路由
 */
export function createWebhookRoutes(
  githubToken: string,
  webhookSecret: string
): Router {
  const router = Router();
  const prController = new PullRequestController(githubToken);

  // 添加 webhook 验证中间件
  router.use(webhookVerification(webhookSecret));

  // 处理 webhook 请求
  router.post("/", async (req: Request, res: Response) => {
    const event = req.headers["github-event"] as string;

    switch (event) {
      case "pull_request":
        await prController.handlePullRequestOpened(req, res);
        break;

      default:
        console.log(`未处理的事件类型: ${event}`);
        res.status(200).json({ message: `Event type '${event}' not handled` });
        break;
    }
  });

  return router;
}
