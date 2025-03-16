import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type { components } from "@octokit/openapi-types";
import type { PullRequest } from "@octokit/webhooks-types";

// 创建扩展了 REST API 方法的 Octokit 类
const MyOctokit = Octokit.plugin(restEndpointMethods);

/**
 * GitHub 服务类，处理与 GitHub API 的交互
 */
export class GitHubService {
  private octokit: InstanceType<typeof MyOctokit>;

  /**
   * 构造函数
   * @param token GitHub API 令牌
   */
  constructor(token: string) {
    this.octokit = new MyOctokit({ auth: token });
  }

  /**
   * 获取 PR 详细信息
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param pullNumber PR 编号
   * @returns PR 详细信息
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<PullRequest> {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return data as unknown as PullRequest;
  }

  /**
   * 获取 PR 修改的文件列表
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param pullNumber PR 编号
   * @returns 修改的文件列表
   */
  async getPullRequestFiles(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<components["schemas"]["diff-entry"][]> {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return data as unknown as components["schemas"]["diff-entry"][];
  }

  /**
   * 获取 PR 的完整信息，包括详情和修改的文件
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param pullNumber PR 编号
   * @returns PR 完整信息
   */
  async getPullRequestFullInfo(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<{
    pullRequest: PullRequest;
    files: components["schemas"]["diff-entry"][];
  }> {
    const [pullRequest, files] = await Promise.all([
      this.getPullRequest(owner, repo, pullNumber),
      this.getPullRequestFiles(owner, repo, pullNumber),
    ]);

    return { pullRequest, files };
  }

  /**
   * 获取文件内容
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param path 文件路径
   * @param ref 分支或提交SHA
   * @returns 文件内容
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      // 检查是否是文件
      if ("content" in data && "encoding" in data) {
        // 解码Base64内容
        if (data.encoding === "base64") {
          return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return data.content;
      }

      throw new Error("不是有效的文件");
    } catch (error) {
      console.error(`获取文件内容失败: ${path}`, error);
      throw error;
    }
  }

  /**
   * 获取PR差异
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param pullNumber PR编号
   * @returns PR差异内容
   */
  async getPullRequestDiff(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<string> {
    try {
      const response = await this.octokit.request(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner,
          repo,
          pull_number: pullNumber,
          headers: {
            accept: "application/vnd.github.v3.diff",
          },
        }
      );

      return response.data as unknown as string;
    } catch (error) {
      console.error(`获取PR差异失败: PR #${pullNumber}`, error);
      throw error;
    }
  }

  /**
   * 添加PR评论
   * @param owner 仓库所有者
   * @param repo 仓库名称
   * @param pullNumber PR编号
   * @param body 评论内容
   * @returns 评论结果
   */
  async addPullRequestComment(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ): Promise<any> {
    try {
      const { data } = await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body,
      });

      return data;
    } catch (error) {
      console.error(`添加PR评论失败: PR #${pullNumber}`, error);
      throw error;
    }
  }
}
