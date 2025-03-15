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
    fileExtension: string
  ): Promise<string> {
    try {
      const prompt = generateCodeReviewPrompt(codeContent, fileExtension);

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
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || "无法生成代码审查结果";
    } catch (error) {
      console.error("代码审查失败:", error);
      throw new Error(`代码审查失败: ${(error as Error).message}`);
    }
  }

  /**
   * 生成PR摘要
   * @param prTitle PR标题
   * @param prDescription PR描述
   * @param changedFiles 修改的文件列表
   * @returns PR摘要
   */
  async generatePRSummary(
    prTitle: string,
    prDescription: string,
    changedFiles: string[]
  ): Promise<string> {
    try {
      const prompt = generatePRSummaryPrompt(
        prTitle,
        prDescription,
        changedFiles
      );

      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content: "你是一位专业的技术文档撰写专家，擅长总结代码变更。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || "无法生成PR摘要";
    } catch (error) {
      console.error("生成PR摘要失败:", error);
      throw new Error(`生成PR摘要失败: ${(error as Error).message}`);
    }
  }

  /**
   * 分析代码变更
   * @param diffContent 代码差异内容
   * @returns 代码变更分析
   */
  async analyzeDiff(diffContent: string): Promise<string> {
    try {
      const prompt = `
请分析以下代码差异，并提供简洁的总结：

\`\`\`diff
${diffContent}
\`\`\`

请包括：
1. 主要变更内容
2. 变更的目的和影响
3. 潜在的问题或改进建议
`;

      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content: "你是一位专业的代码审查专家，擅长分析代码差异。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      return response.choices[0]?.message?.content || "无法生成代码差异分析";
    } catch (error) {
      console.error("代码差异分析失败:", error);
      throw new Error(`代码差异分析失败: ${(error as Error).message}`);
    }
  }
}

// 导出OpenAI服务实例
export default new OpenAIService();
