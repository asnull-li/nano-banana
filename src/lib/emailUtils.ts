/**
 * 邮箱工具函数
 * 提供基本的邮箱标准化功能
 */

/**
 * 标准化邮箱地址
 * 进行基本的邮箱格式清理
 *
 * 标准化规则：
 * - 转换为小写
 * - 去除首尾空格
 *
 * @param email 原始邮箱地址
 * @returns 标准化后的邮箱地址
 *
 * @example
 * standardizeEmail('User.Name@Gmail.COM ') // 返回: user.name@gmail.com
 * standardizeEmail(' USER@EXAMPLE.COM')    // 返回: user@example.com
 */
export function standardizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return email;
  }

  // 只做基本清理：转小写、去空格
  return email.toLowerCase().trim();
}

/**
 * 检查两个邮箱是否为同一个邮箱
 *
 * @param email1 第一个邮箱
 * @param email2 第二个邮箱
 * @returns 是否为同一个邮箱
 */
export function isSameEmail(email1: string, email2: string): boolean {
  return standardizeEmail(email1) === standardizeEmail(email2);
}
