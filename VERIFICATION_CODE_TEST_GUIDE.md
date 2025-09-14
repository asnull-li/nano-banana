# 验证码登录测试指南

## 实现状态 ✅

- ✅ 验证码服务已创建 (`/src/services/verifyCode.ts`)
- ✅ 发送验证码 API 已实现 (`/src/app/api/auth/send-code/route.ts`)
- ✅ NextAuth 配置已更新为支持验证码登录
- ✅ 登录表单 UI 已更新为两步验证流程
- ✅ 多语言支持已添加（支持 7 种语言）
- ✅ TypeScript 错误已修复

## 测试步骤

### 1. 启动开发服务器

```bash
pnpm dev
```

服务器运行在: http://localhost:3003

### 2. 访问登录页面

打开浏览器访问登录页面：

- 直接访问: http://localhost:3003/auth/signin
- 或点击网站任意"登录"按钮

### 3. 测试验证码登录流程

#### 步骤 1: 选择邮箱登录

1. 在登录页面点击 "Continue with Email" / "使用邮箱登录" 按钮
2. 页面会展开显示邮箱输入框

#### 步骤 2: 输入邮箱并发送验证码

1. 输入你的邮箱地址（例如：test@example.com）
2. 点击 "Send Verification Code" / "发送验证码" 按钮
3. 等待邮件发送（按钮会显示 "Sending code..." / "发送中..."）

#### 步骤 3: 输入验证码

1. 查看你的邮箱收件箱
   - 发件人: no-reply1@nanobanana.org
   - 标题: Your verification code: XXXXXX
2. 输入收到的 6 位数字验证码
3. 点击 "Sign In" / "登录" 按钮

#### 步骤 4: 验证登录成功

- 成功登录后会跳转到首页或之前访问的页面
- 新用户会自动创建账户并获得初始积分

### 4. 功能测试点

#### ✅ 验证码发送

- [x] 输入有效邮箱后能成功发送验证码
- [x] 收到的邮件包含 6 位数字验证码
- [x] 邮件模板样式正确且美观

#### ✅ 频率限制

- [x] 60 秒内不能重复发送验证码
- [x] 显示倒计时 "Resend in Xs" / "重新发送倒计时 Xs"
- [x] 倒计时结束后可以重新发送

#### ✅ 验证码验证

- [x] 正确的验证码可以成功登录
- [x] 错误的验证码显示错误提示
- [x] 验证码 5 分钟后过期

#### ✅ 用户管理

- [x] 新邮箱用户自动注册
- [x] 新用户获得初始积分
- [x] 已存在用户直接登录

#### ✅ UI/UX

- [x] 两步验证流程清晰
- [x] 错误提示明确
- [x] 支持返回上一步
- [x] 验证码输入框自动聚焦
- [x] 输入框只允许输入数字

#### ✅ 多语言支持

- [x] 支持中文、英文、日语、韩语、西班牙语、德语、法语
- [x] 所有文本都已国际化

## 故障排查

### 收不到验证码邮件

1. **检查垃圾邮件文件夹**
2. **查看 Resend 控制台**: https://resend.com/emails
3. **检查服务器日志**: 查看是否有发送错误
4. **确认环境变量配置**:
   ```
   RESEND_API_KEY=你的API密钥
   RESEND_SENDER_EMAIL=no-reply1@nanobanana.org
   NEXT_PUBLIC_AUTH_EMAIL_ENABLED=true
   ```

### 验证码无效

1. **确认验证码正确**: 6 位数字，注意不要有空格
2. **检查验证码是否过期**: 验证码有效期 5 分钟
3. **查看数据库**: 检查 verification_tokens 表

### 登录后没有积分

1. **检查用户类型**: 确认是新用户还是老用户
2. **查看积分记录**: 检查 credits_transactions 表
3. **确认积分服务正常**: 检查 increaseCredits 函数

## 数据库检查

### 查看验证码记录

```sql
SELECT * FROM verification_tokens ORDER BY expires DESC;
```

### 查看用户记录

```sql
SELECT * FROM users WHERE email = 'your-email@example.com';
```

### 查看积分记录

```sql
SELECT * FROM credits_transactions WHERE user_uuid = '用户UUID';
```

## 生产环境注意事项

1. **更新环境变量**:

   - 设置正确的 `AUTH_URL`
   - 配置生产环境的 `RESEND_API_KEY`
   - 验证发件邮箱域名

2. **安全考虑**:

   - 考虑增加验证码重试次数限制
   - 实施 IP 频率限制
   - 监控异常登录行为

3. **性能优化**:
   - 定期清理过期验证码
   - 考虑使用 Redis 缓存验证码

## 相关文件

- 验证码服务: `/src/services/verifyCode.ts`
- 发送 API: `/src/app/api/auth/send-code/route.ts`
- 认证配置: `/src/auth/config.ts`
- 登录表单: `/src/components/sign/form.tsx`
- 多语言文件: `/src/i18n/messages/*.json`
