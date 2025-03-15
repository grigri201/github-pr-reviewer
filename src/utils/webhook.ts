import crypto from "crypto";

/**
 * 验证 GitHub webhook 签名
 * @param payload 请求体
 * @param signature GitHub 签名头
 * @param secret Webhook 密钥
 * @returns 是否验证通过
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");

  // 使用安全的时间比较方法防止时序攻击
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    return false;
  }
}

/**
 * 格式化 PR 文件变更信息用于控制台输出
 * @param file PR 文件信息
 * @returns 格式化后的字符串
 */
export function formatFileChanges(file: {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}): string {
  const statusEmoji =
    {
      added: "🟢",
      removed: "🔴",
      modified: "🟠",
      renamed: "🔄",
      copied: "📋",
      changed: "📝",
      unchanged: "⚪",
    }[file.status as string] || "❓";

  let output = `${statusEmoji} ${file.filename} (${file.status})\n`;
  output += `  Changes: +${file.additions}/-${file.deletions}\n`;

  if (file.patch) {
    // 限制 patch 长度，避免输出过长
    const maxPatchLength = 500;
    const truncatedPatch =
      file.patch.length > maxPatchLength
        ? file.patch.substring(0, maxPatchLength) + "...(truncated)"
        : file.patch;

    output += `  Patch:\n${truncatedPatch
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")}\n`;
  }

  return output;
}
