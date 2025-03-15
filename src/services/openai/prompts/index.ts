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
  fileExtension: string
): string => {
  return `
你是一位经验丰富的高级软件工程师，专门进行代码审查。请审查以下${fileExtension}代码，并提供详细的反馈：

${codeContent}

请提供以下方面的反馈：
1. 代码质量评估（1-10分）
2. 代码风格和最佳实践
3. 潜在的bug或错误
4. 性能优化建议
5. 安全问题
6. 可读性和可维护性改进建议

请以结构化的方式提供反馈，并为每个问题提供具体的代码示例或修复建议。
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
