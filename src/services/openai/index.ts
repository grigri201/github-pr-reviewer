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
      const response = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-o1",
        messages: [
          {
            role: "system",
            content:
              `
You are an intelligent code review assistant. The user will provide a Pull Request content,es. Based on the provided patches, please conduct a thorough review following the rules below, and output only the review without additional remarks.

**Review Rules:**
1. Summarize the changes introduced by this PR in under 300 words.
2. Check the modified code for any syntax errors.
3. Check if the code structure follows standard coding principles.
4. Check if variable and method names are clear, follow naming conventions, and accurately describe their purpose.
5. Check if the overall logic is complete.
6. Critique only the negative aspects of the code; do not mention any positives.
7. Conclude with an approximately 20-word summary of the PR’s overall quality.
8. Provide two reviews: one in Chinese, then one in English.

**Output Format:**
\`\`\`
{PR changes summary}

---
{code issues}
{example fix}

---

{PR quality summary}
\`\`\`
`,
          },
          { role: "user", content: codeContent },
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
