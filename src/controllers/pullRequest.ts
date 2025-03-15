import { Request, Response } from "express";
import { GitHubService } from "../services/github";
import { formatFileChanges } from "../utils/webhook";
import type { PullRequestPayload } from "../types/github";

/**
 * PR 控制器类，处理 PR 相关的业务逻辑
 */
export class PullRequestController {
  private githubService: GitHubService;

  /**
   * 构造函数
   * @param githubToken GitHub API 令牌
   */
  constructor(githubToken: string) {
    this.githubService = new GitHubService(githubToken);
  }

  /**
   * 处理 PR 创建事件
   * @param req Express 请求对象
   * @param res Express 响应对象
   */
  async handlePullRequestOpened(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as PullRequestPayload;

      if (payload.action !== "opened") {
        console.log(`忽略非 opened 操作: ${payload.action}`);
        res.status(200).json({ message: "Ignored non-opened action" });
        return;
      }

      const { repository, pull_request: pr } = payload;
      const owner = repository.owner.login;
      const repo = repository.name;
      const pullNumber = pr.number;

      console.log(`\n===== 新的 PR 创建 =====`);
      console.log(`PR #${pullNumber}: ${pr.title}`);
      console.log(`创建者: ${pr.user.login}`);
      console.log(`URL: ${pr.html_url}`);

      if (pr.body) {
        console.log(`\n描述:\n${pr.body}`);
      }

      console.log(`\n分支: ${pr.head.ref} -> ${pr.base.ref}`);
      console.log(`提交: ${pr.head.sha.substring(0, 7)}`);

      // 获取 PR 修改的文件
      const files = await this.githubService.getPullRequestFiles(
        owner,
        repo,
        pullNumber
      );

      console.log(`\n===== 修改的文件 (${files.length}) =====`);

      if (files.length === 0) {
        console.log("没有修改的文件");
      } else {
        files.forEach((file) => {
          console.log(formatFileChanges(file));
        });
      }

      console.log(
        `\n总计: +${pr.additions}/-${pr.deletions} (${pr.changed_files} 个文件)`
      );
      console.log(`===== PR 信息结束 =====\n`);

      res.status(200).json({
        message: "Pull request processed successfully",
        pr_number: pullNumber,
        files_count: files.length,
      });
    } catch (error) {
      console.error("处理 PR 时出错:", error);
      res.status(500).json({ error: "Error processing pull request" });
    }
  }
}
