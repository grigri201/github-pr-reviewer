import { Request, Response, NextFunction } from "express";
import { verifyWebhookSignature } from "../utils/webhook";

/**
 * GitHub webhook 验证中间件
 * @param secret webhook 密钥
 */
export function webhookVerification(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-hub-signature-256"] as string;
    const payload = JSON.stringify(req.body);

    if (!verifyWebhookSignature(payload, signature, secret)) {
      console.error("Webhook 签名验证失败");
      return res
        .status(401)
        .json({ error: "Webhook signature verification failed" });
    }

    // 验证 webhook 事件类型
    const event = req.headers["x-github-event"] as string;
    if (!event) {
      console.error("缺少 GitHub 事件类型");
      return res.status(400).json({ error: "Missing GitHub event type" });
    }

    // 将事件类型添加到请求对象中，方便后续处理
    req.headers["github-event"] = event;

    next();
  };
}
