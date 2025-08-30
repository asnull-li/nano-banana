import { db } from "@/db";
import { verificationTokens } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import crypto from "crypto";

/**
 * 验证码服务
 * 用于生成、存储、验证邮箱验证码
 */

// 生成6位数字验证码
export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 生成唯一的 token ID
function generateTokenId(): string {
  return crypto.randomBytes(32).toString("hex");
}

// 存储验证码
export async function storeVerifyCode(email: string, code: string, expiresInMinutes: number = 5) {
  try {
    // 删除该邮箱的旧验证码
    await db()
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // 创建新验证码
    const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const token = generateTokenId();
    
    await db().insert(verificationTokens).values({
      identifier: email,
      token: `${token}:${code}`, // 格式：token:code
      expires,
    });

    return { success: true, code };
  } catch (error) {
    console.error("Store verify code error:", error);
    return { success: false, error: "Failed to store verification code" };
  }
}

// 检查验证码（不删除）
export async function checkCode(email: string, code: string) {
  try {
    // 查找有效的验证码
    const [record] = await db()
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          gte(verificationTokens.expires, new Date())
        )
      )
      .limit(1);

    if (!record) {
      return { success: false, error: "CODE_EXPIRED" };
    }

    // 提取验证码
    const storedCode = record.token.split(":")[1];
    
    if (storedCode !== code) {
      return { success: false, error: "INVALID_CODE" };
    }

    return { success: true };
  } catch (error) {
    console.error("Check code error:", error);
    return { success: false, error: "VERIFY_FAILED" };
  }
}

// 验证验证码（验证并删除）
export async function verifyCode(email: string, code: string) {
  try {
    // 先检查验证码
    const checkResult = await checkCode(email, code);
    if (!checkResult.success) {
      return checkResult;
    }

    // 验证成功，删除验证码
    await db()
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    return { success: true };
  } catch (error) {
    console.error("Verify code error:", error);
    return { success: false, error: "VERIFY_FAILED" };
  }
}

// 检查是否可以发送验证码（防止频繁发送）
export async function canSendCode(email: string): Promise<boolean> {
  try {
    // 检查最近1分钟内是否已发送
    // 验证码创建时间 = expires - 5分钟
    // 如果 expires > 当前时间 + 4分钟，说明是在最近1分钟内创建的
    const fourMinutesLater = new Date(Date.now() + 4 * 60 * 1000);
    
    const [recent] = await db()
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          gte(verificationTokens.expires, fourMinutesLater)
        )
      )
      .limit(1);

    return !recent;
  } catch (error) {
    console.error("Check can send code error:", error);
    return true; // 出错时允许发送
  }
}

// 清理过期的验证码
export async function cleanupExpiredCodes() {
  try {
    const deleted = await db()
      .delete(verificationTokens)
      .where(lte(verificationTokens.expires, new Date()))
      .returning();
    
    console.log(`Cleaned up ${deleted.length} expired verification codes`);
    return deleted.length;
  } catch (error) {
    console.error("Cleanup expired codes error:", error);
    return 0;
  }
}