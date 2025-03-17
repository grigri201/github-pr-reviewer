import { GitHubService } from "./github";
import { formatFileChanges } from "../utils/webhook";
import { PullRequestOpenedEvent, PullRequestSynchronizeEvent, WebhookEvent } from "@octokit/webhooks-types";
import openAIService from "./openai";

/**
 * PR 控制器类，处理 PR 相关的业务逻辑
 */
export class PullRequestService {
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
   * @param event PR 创建事件
   */
  async handlePullRequestOpened(event: PullRequestOpenedEvent | PullRequestSynchronizeEvent) {
    try {
      const { repository, pull_request } = event;

      const owner = repository.owner.login;
      const repo = repository.name;
      const pullNumber = pull_request.number;

      console.log(`\n===== 新的 PR 创建 =====`);
      console.log(`PR #${pullNumber}: ${pull_request.title}`);
      console.log(`创建者: ${pull_request.user.login}`);
      console.log(`URL: ${pull_request.html_url}`);

      if (pull_request.body) {
        console.log(`\n描述:\n${pull_request.body}`);
      }

      console.log(
        `\n分支: ${pull_request.head.ref} -> ${pull_request.base.ref}`
      );
      console.log(`提交: ${pull_request.head.sha.substring(0, 7)}`);

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
        `\n总计: +${pull_request.additions}/-${pull_request.deletions} (${pull_request.changed_files} 个文件)`
      );
      console.log(`===== PR 信息结束 =====\n`);

      let fileContents = "";
      // 对每个修改的文件进行代码审查
      for (const file of files) {
        fileContents += `
        file name:
        ${file.filename}

        diff content:
        ${file.patch}
        `
      }

      
      const reviewResult = await openAIService.reviewCode(fileContents);
        
      console.log(`\n===== 文件审查结果: =====`);
      console.log(reviewResult);
      console.log(`===== 审查结束 =====\n`);

      return {
        message: "Pull request processed successfully",
        pr_number: pullNumber,
        files_count: files.length,
      };
    } catch (error) {
      console.error("处理 PR 时出错:", error);
      throw new Error("Error processing pull request");
    }
  }
}
