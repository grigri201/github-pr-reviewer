import { Request, Response } from "express";
import { GitHubService } from "../services/github";
import openaiService from "../services/openai";
import { PullRequestFile } from "../types/github";

// 从环境变量获取GitHub令牌
const githubToken = process.env.GITHUB_TOKEN || "";
// 创建GitHub服务实例
const githubService = new GitHubService(githubToken);

/**
 * PR审查控制器
 * 处理PR审查相关的业务逻辑
 */
class ReviewController {
  /**
   * 处理PR创建或更新事件
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async handlePullRequest(req: Request, res: Response): Promise<void> {
    try {
      const { action, pull_request, repository } = req.body;

      // 只处理PR打开或同步事件
      if (action !== "opened" && action !== "synchronize") {
        res
          .status(200)
          .json({ message: `PR ${action} 事件已接收，但不需要审查` });
        return;
      }

      const prNumber = pull_request.number;
      const repoOwner = repository.owner.login;
      const repoName = repository.name;

      console.log(`处理 ${repoOwner}/${repoName} 仓库的 PR #${prNumber}`);

      // 获取PR详细信息
      const prDetails = await githubService.getPullRequest(
        repoOwner,
        repoName,
        prNumber
      );

      // 获取PR修改的文件
      const changedFiles = await githubService.getPullRequestFiles(
        repoOwner,
        repoName,
        prNumber
      );

      // 生成PR摘要
      const prSummary = await openaiService.generatePRSummary(
        prDetails.title,
        prDetails.body || "",
        changedFiles.map((file) => file.filename)
      );

      console.log("PR摘要:", prSummary);

      // 对每个修改的文件进行代码审查
      const reviewPromises = changedFiles.map(async (file: PullRequestFile) => {
        // 跳过删除的文件和二进制文件
        if (file.status === "removed" || file.binary) {
          return null;
        }

        // 获取文件内容
        const fileContent = await githubService.getFileContent(
          repoOwner,
          repoName,
          file.filename,
          pull_request.head.sha
        );

        // 获取文件扩展名
        const fileExtension = file.filename.split(".").pop() || "";

        // 进行代码审查
        const reviewResult = await openaiService.reviewCode(
          fileContent,
          fileExtension
        );

        return {
          filename: file.filename,
          review: reviewResult,
        };
      });

      const fileReviews = (await Promise.all(reviewPromises)).filter(Boolean);

      // 在这里可以将审查结果添加为PR评论
      // 示例: await githubService.addPullRequestComment(repoOwner, repoName, prNumber, reviewResult);

      res.status(200).json({
        message: "PR审查完成",
        summary: prSummary,
        fileReviews,
      });
    } catch (error) {
      console.error("PR审查失败:", error);
      res
        .status(500)
        .json({ error: `PR审查失败: ${(error as Error).message}` });
    }
  }

  /**
   * 分析PR的代码差异
   * @param req Express请求对象
   * @param res Express响应对象
   */
  async analyzePullRequestDiff(req: Request, res: Response): Promise<void> {
    try {
      const { owner, repo, pull_number } = req.params;

      // 获取PR差异
      const diff = await githubService.getPullRequestDiff(
        owner,
        repo,
        Number(pull_number)
      );

      // 分析差异
      const analysis = await openaiService.analyzeDiff(diff);

      res.status(200).json({
        message: "差异分析完成",
        analysis,
      });
    } catch (error) {
      console.error("差异分析失败:", error);
      res
        .status(500)
        .json({ error: `差异分析失败: ${(error as Error).message}` });
    }
  }
}

export default new ReviewController();
