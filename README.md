# GitHub PR Webhook Reviewer

一个基于 GitHub Webhook 的应用，用于接收 PR 创建通知并在控制台显示 PR 详细信息。

## 功能

- 接收 GitHub PR 创建的 webhook 通知
- 获取 PR 详细信息
- 获取 PR 修改的文件和内容
- 在控制台显示这些信息

## 技术栈

- [Bun](https://bun.sh/) - JavaScript 运行时和包管理器
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
- [Express](https://expressjs.com/) - Web 框架
- [Octokit](https://github.com/octokit) - GitHub API 客户端

## 安装

1. 克隆仓库

```bash
git clone https://github.com/yourusername/github-pr-webhook-reviewer.git
cd github-pr-webhook-reviewer
```

2. 安装依赖

```bash
bun install
```

3. 配置环境变量

复制 `.env.example` 文件为 `.env` 并填写必要的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写以下信息：

- `GITHUB_TOKEN`: GitHub 个人访问令牌，需要有 `repo` 权限
- `WEBHOOK_SECRET`: GitHub webhook 密钥，用于验证请求
- `PORT`: 应用监听的端口（默认为 3000）

## 使用

1. 启动应用

```bash
bun start
```

2. 设置 GitHub Webhook

在 GitHub 仓库中，前往 Settings > Webhooks > Add webhook，并配置：

- Payload URL: 你的服务器 URL，例如 `https://your-domain.com/webhook`
- Content type: `application/json`
- Secret: 与 `.env` 文件中的 `WEBHOOK_SECRET` 相同
- 选择 "Let me select individual events" 并勾选 "Pull requests"

3. 本地开发

如果你在本地开发，可以使用 [ngrok](https://ngrok.com/) 等工具将本地服务暴露到公网：

```bash
ngrok http 3000
```

然后使用 ngrok 提供的 URL 作为 webhook 的 Payload URL。

## 开发

- 启动开发服务器（带热重载）：

```bash
bun dev
```

- 类型检查：

```bash
bun typecheck
```

- 构建生产版本：

```bash
bun build
```

## 项目结构

```
src/
├── controllers/    # 业务逻辑控制器
├── middleware/     # Express 中间件
├── routes/         # API 路由定义
├── services/       # 外部服务交互
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
└── index.ts        # 应用入口
```

## 许可证

MIT
