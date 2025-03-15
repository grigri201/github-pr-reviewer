/**
 * GitHub webhook 事件类型
 */
export type WebhookEvent =
  | "pull_request"
  | "push"
  | "issues"
  | "issue_comment"
  | string;

/**
 * PR 操作类型
 */
export type PullRequestAction =
  | "opened"
  | "closed"
  | "reopened"
  | "synchronize"
  | "edited"
  | "assigned"
  | "unassigned"
  | "review_requested"
  | "review_request_removed";

/**
 * PR 文件变更类型
 */
export type FileStatus =
  | "added"
  | "removed"
  | "modified"
  | "renamed"
  | "copied"
  | "changed"
  | "unchanged";

/**
 * PR 文件信息
 */
export interface PullRequestFile {
  sha: string;
  filename: string;
  status: FileStatus;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
}

/**
 * PR 基本信息
 */
export interface PullRequestInfo {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  body?: string;
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  additions: number;
  deletions: number;
  changed_files: number;
}

/**
 * 仓库信息
 */
export interface RepositoryInfo {
  name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description?: string;
  default_branch: string;
}

/**
 * PR Webhook 负载
 */
export interface PullRequestPayload {
  action: PullRequestAction;
  number: number;
  pull_request: PullRequestInfo;
  repository: RepositoryInfo;
  sender: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}
