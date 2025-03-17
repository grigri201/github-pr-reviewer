import OpenAI from "openai";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 检查API密钥是否存在
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY 环境变量未设置");
  process.exit(1);
}

// 创建OpenAI客户端实例
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openaiClient;
