import { Router, Request, Response } from "express";
import { PullRequestService } from "../services/pull-request";
import { webhookVerification } from "../middleware/webhook";
import { PullRequestOpenedEvent, PullRequestSynchronizeEvent, WebhookEvent } from "@octokit/webhooks-types";

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
  const prController = new PullRequestService(githubToken);

  // 添加 webhook 验证中间件
  router.use(webhookVerification(webhookSecret));

  // 处理 webhook 请求
  router.post("/", async (req: Request, res: Response) => {
    try {
      const event = req.body as WebhookEvent;

      const eventType = matchEvent(event);
      switch (eventType) {
        case "pullRequestOpened":
          const openedResult = await prController.handlePullRequestOpened(
            event as PullRequestOpenedEvent
          );
          res.status(200).json(openedResult);
          break;
        case "pullRequestSynchronized":
          const result = await prController.handlePullRequestOpened(
            event as PullRequestSynchronizeEvent
          );
          res.status(200).json(result);
          break;
        default:
          console.log(`未处理的事件: \n${JSON.stringify(event)}`);
          res.status(200).end();
          break;
      }
    } catch (error) {
      console.error("处理 webhook 时出错:", error);
      res.status(500).json({ error });
    }
  });

  return router;
}

export function matchEvent(event: WebhookEvent) {
  if (!("pull_request" in event) || !("action" in event)) {
    return null;
  }
  if (event.action === "opened") {
    return "pullRequestOpened";
  }
  if (event.action === "synchronize") {
    return "pullRequestSynchronized";
  }
  return null;
}
