# 邮箱登录测试指南

## 当前配置状态 ✅
- Resend API 密钥：已配置且有效
- 发件邮箱：no-reply1@nanobanana.org
- AUTH_URL：已更新为正确端口 (3003)
- 数据库：已连接并创建验证令牌表

## 测试步骤

### 1. 重启开发服务器（重要！）
```bash
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
pnpm dev
```

### 2. 访问登录页面
打开浏览器访问：`http://localhost:3003/auth/signin`

### 3. 测试邮箱登录
1. 输入你的邮箱地址
2. 点击"Send Magic Link"或"发送登录链接"
3. 页面会跳转到验证提示页

### 4. 检查邮箱
- 查看收件箱中的登录链接邮件
- 如果没收到，检查垃圾邮件文件夹
- 邮件发件人：no-reply1@nanobanana.org

### 5. 完成登录
点击邮件中的链接即可完成登录

## 注意事项

### Resend 免费账户限制
- 每月 100 封邮件限制
- 只能发送到验证过的邮箱（开发阶段）
- 升级到付费账户可解除限制

### 故障排查

#### 如果收不到邮件：
1. 检查邮箱地址是否正确
2. 查看垃圾邮件文件夹
3. 在 Resend 控制台查看发送日志：https://resend.com/emails

#### 如果点击链接后登录失败：
1. 确保链接在 24 小时内使用
2. 检查 AUTH_URL 是否正确
3. 查看控制台错误信息

## 验证积分功能

### 检查用户积分
```bash
# 查看指定邮箱用户的积分
node test-email-credits.js your-email@example.com
```

### 重新测试注册
如果需要重新测试同一邮箱的注册流程：
```bash
# 1. 清理测试用户
node cleanup-test-user.js your-email@example.com

# 2. 重新注册该邮箱
# 访问登录页面并使用该邮箱登录
```

## 生产环境配置

部署到生产环境时，记得更新：
```env
AUTH_URL="https://your-domain.com/api/auth"
RESEND_SENDER_EMAIL="noreply@your-domain.com"
```

并在 Resend 控制台验证你的域名以提高邮件送达率。