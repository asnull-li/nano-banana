# 邮箱登录功能配置指南

## 功能说明
已成功集成邮箱登录功能，用户可以通过邮箱接收 Magic Link 进行无密码登录。

## 配置步骤

### 1. 配置环境变量
在 `.env` 文件中添加以下配置：

```env
# 启用邮箱登录
NEXT_PUBLIC_AUTH_EMAIL_ENABLED="true"

# Resend 邮件服务配置
RESEND_API_KEY="你的Resend API密钥"
RESEND_SENDER_EMAIL="noreply@yourdomain.com"
```

### 2. 获取 Resend API Key
1. 访问 [Resend](https://resend.com/)
2. 注册账号并登录
3. 创建 API Key
4. 验证发件域名（可选但推荐）

### 3. 数据库已准备就绪
- ✅ `verification_tokens` 表已创建
- ✅ 数据库迁移已完成

## 测试邮箱登录

### 本地测试
1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问登录页面：`http://localhost:3003/auth/signin` (或其他可用端口)

3. 输入邮箱地址并点击"Send Magic Link"

4. 检查邮箱收到的登录链接

5. 点击链接完成登录

### 注意事项
- 开发环境下，确保 `AUTH_URL` 设置正确
- 生产环境需要验证发件域名以提高送达率
- Magic Link 默认有效期为 24 小时

## 实现细节

### 核心文件修改
1. **src/auth/config.ts** - 添加 Resend 提供商和自定义适配器
2. **src/auth/adapter.ts** - 自定义邮箱登录适配器
3. **src/auth/handler.ts** - 支持邮箱登录用户处理
4. **src/db/schema.ts** - 添加 verification_tokens 表
5. **src/lib/auth.ts** - 添加邮箱登录检测函数
6. **src/components/sign/form.tsx** - 启用邮箱登录表单
7. **src/app/[locale]/auth/verify-request/page.tsx** - 邮件验证提示页面

### 用户体验流程
1. 用户输入邮箱
2. 系统发送 Magic Link 到邮箱
3. 用户点击链接自动登录
4. 新用户自动创建账号并获得初始积分
5. 现有用户直接登录

### 与现有系统的集成
- 完全复用现有的 `handleSignInUser` 和 `saveUser` 逻辑
- 邮箱登录用户的 `signin_provider` 为 "email"
- 继续使用 JWT 策略，无需会话管理
- 新用户自动获得初始积分（与其他登录方式一致）

## 故障排查

### 邮件发送失败
- 检查 RESEND_API_KEY 是否正确
- 确认 RESEND_SENDER_EMAIL 格式正确
- 查看控制台错误信息

### 登录链接无效
- 检查 AUTH_URL 环境变量
- 确认数据库连接正常
- 查看 verification_tokens 表是否有记录

### 用户创建失败
- 检查数据库连接
- 查看 users 表结构
- 确认 handleSignInUser 函数执行正常

## 生产部署清单
- [ ] 设置生产环境的 RESEND_API_KEY
- [ ] 验证发件域名
- [ ] 配置正确的 AUTH_URL
- [ ] 测试邮件送达率
- [ ] 监控登录成功率