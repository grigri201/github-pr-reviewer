/**
 * OpenAI提示模板
 * 这个文件包含用于不同任务的提示模板
 */

/**
 * 代码审查提示模板
 * @param codeContent 代码内容
 * @param fileExtension 文件扩展名
 * @returns 格式化的提示
 */
export const generateCodeReviewPrompt = (
  codeContent: string,
): string => {
  return `
You are an intelligent code review assistant. The user will provide a filename and a code patch. Based on the provided patch, please conduct a thorough review following the rules below, and output only the review without additional remarks.

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

### Chinese Review

\`\`\`
{PR changes summary}

---
{code issues}
{example fix}

---

{PR quality summary}
\`\`\`

### English Review

\`\`\`
{PR changes summary}

---
{code issues}
{example fix}

---
{PR quality summary}
\`\`\`
`;
};

/**
 * PR摘要生成提示模板
 * @param prTitle PR标题
 * @param prDescription PR描述
 * @param changedFiles 修改的文件列表
 * @returns 格式化的提示
 */
export const generatePRSummaryPrompt = (
  prTitle: string,
  prDescription: string,
  changedFiles: string[]
): string => {
  return `
请为以下GitHub Pull Request生成一个简洁但全面的摘要：

标题: ${prTitle}
描述: ${prDescription}
修改的文件:
${changedFiles.join("\n")}

请包括：
1. PR的主要目的和解决的问题
2. 主要更改的概述
3. 潜在的影响和注意事项

请以简洁、专业的语言撰写摘要。
`;
};
