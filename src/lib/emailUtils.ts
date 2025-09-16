/**
 * 邮箱工具函数
 * 使用 email-normalizer 库处理各种邮箱服务商的别名规则
 */

import { normalizeEmail } from 'email-normalizer';

/**
 * 标准化邮箱地址
 * 处理Gmail、Yahoo、ProtonMail等服务商的别名特性
 *
 * 支持的标准化规则：
 * - Gmail: 移除+标签、点号，统一域名为gmail.com
 * - Yahoo: 移除+标签
 * - ProtonMail: 移除+标签
 * - 其他服务商: 基本清理和+标签移除
 *
 * @param email 原始邮箱地址
 * @returns 标准化后的邮箱地址
 *
 * @example
 * standardizeEmail('User.Name+tag@gmail.com') // 返回: username@gmail.com
 * standardizeEmail('user+spam@yahoo.com')     // 返回: user@yahoo.com
 */
export function standardizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  try {
    // 优先使用我们的增强标准化函数，它更全面
    const enhanced = enhancedNormalizeEmail(email);

    // 对于Gmail，再用 email-normalizer 确保完整性
    if (enhanced.endsWith('@gmail.com')) {
      const libResult = normalizeEmail({ email: enhanced });
      return libResult;
    }

    return enhanced;
  } catch (error) {
    // 如果出错，使用回退逻辑
    console.warn('Email normalizer failed, using fallback:', error);
    return enhancedNormalizeEmail(email);
  }
}


/**
 * 增强的邮箱标准化函数
 * 结合 email-normalizer 库和自定义逻辑
 */
function enhancedNormalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  // 基本清理：转小写、去空格
  const cleanEmail = email.toLowerCase().trim();

  // 分离用户名和域名
  const [localPart, domain] = cleanEmail.split('@');

  if (!localPart || !domain) {
    return cleanEmail;
  }

  // 支持+号别名的邮件服务商列表
  const supportsPlusAliasing = [
    'gmail.com', 'googlemail.com',
    'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'ymail.com',
    'protonmail.com', 'proton.me', 'pm.me',
    'fastmail.com', 'fastmail.fm',
    'icloud.com', 'me.com', 'mac.com',
    'hey.com'
  ];

  // Gmail 特殊处理
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // 移除+号及其后面的所有内容
    const cleanLocal = localPart.split('+')[0];
    // 移除所有点号
    const normalizedLocal = cleanLocal.replace(/\./g, '');
    // 统一使用gmail.com域名
    return `${normalizedLocal}@gmail.com`;
  }

  // 其他支持+号别名的服务商
  if (supportsPlusAliasing.includes(domain)) {
    const cleanLocal = localPart.split('+')[0];
    return `${cleanLocal}@${domain}`;
  }

  // 默认情况：只做基本清理
  return cleanEmail;
}

/**
 * 检查两个邮箱是否为同一个邮箱（考虑别名）
 *
 * @param email1 第一个邮箱
 * @param email2 第二个邮箱
 * @returns 是否为同一个邮箱
 */
export function isSameEmail(email1: string, email2: string): boolean {
  return standardizeEmail(email1) === standardizeEmail(email2);
}