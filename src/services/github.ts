import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type { PullRequestFile, PullRequestInfo } from "../types/github";

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
  ): Promise<PullRequestInfo> {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return data as unknown as PullRequestInfo;
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
  ): Promise<PullRequestFile[]> {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return data as unknown as PullRequestFile[];
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
    pullRequest: PullRequestInfo;
    files: PullRequestFile[];
  }> {
    const [pullRequest, files] = await Promise.all([
      this.getPullRequest(owner, repo, pullNumber),
      this.getPullRequestFiles(owner, repo, pullNumber),
    ]);

    return { pullRequest, files };
  }
}
