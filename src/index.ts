import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createWebhookRoutes } from "./routes/webhook";

// 加载环境变量
dotenv.config();

// 获取环境变量
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 验证必要的环境变量
if (!GITHUB_TOKEN) {
  console.error("错误: 缺少 GITHUB_TOKEN 环境变量");
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.error("错误: 缺少 WEBHOOK_SECRET 环境变量");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("警告: 缺少 OPENAI_API_KEY 环境变量，AI 代码审查功能将不可用");
}

// 创建 Express 应用
const app = express();

// 配置中间件
app.use(bodyParser.json());

// 健康检查路由
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 设置 webhook 路由
app.use("/webhook", createWebhookRoutes(GITHUB_TOKEN, WEBHOOK_SECRET));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log("准备接收 GitHub webhook 请求...");
  console.log(`Webhook URL: http://your-domain.com/webhook`);
  console.log(`代码审查 API: http://your-domain.com/api/review`);
  console.log("提示: 使用 ngrok 等工具可以将本地服务暴露到公网");
});
