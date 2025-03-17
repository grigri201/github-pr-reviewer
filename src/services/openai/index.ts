import openaiClient from "./client";
import { generateCodeReviewPrompt, generatePRSummaryPrompt } from "./prompts";

/**
 * OpenAI服务类
 * 提供与OpenAI API交互的方法
 */
class OpenAIService {
  /**
   * 对代码进行审查
   * @param codeContent 代码内容
   * @param fileExtension 文件扩展名
   * @returns 审查结果
   */
  async reviewCode(
    codeContent: string,
  ): Promise<string> {
    try {
      const prompt = generateCodeReviewPrompt(codeContent);

      console.log(prompt);
      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "你是一位专业的代码审查助手，提供详细、有建设性的代码反馈。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "无法生成代码审查结果";
    } catch (error) {
      console.error("代码审查失败:", error);
      throw new Error(`代码审查失败: ${(error as Error).message}`);
    }
  }
}

// 导出OpenAI服务实例
export default new OpenAIService();
