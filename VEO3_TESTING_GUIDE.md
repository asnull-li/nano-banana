# Veo3 视频生成 - 省钱测试方案

## 🎯 方案对比

| 方案 | 成本 | 速度 | 真实度 | 适用场景 |
|------|------|------|--------|----------|
| **Mock 模式** | 💰 免费 | ⚡ 3秒 | ⭐ 低 | 前端开发、UI测试 |
| **测试积分** | 💰💰 1次 | ⏱️ 真实 | ⭐⭐⭐ 高 | 接口验证 |
| **仅 Fast 模式** | 💰💰💰 40积分 | ⏱️ 真实 | ⭐⭐⭐ 高 | 完整功能测试 |
| **生产环境** | 💰💰💰💰 300积分 | ⏱️ 真实 | ⭐⭐⭐⭐⭐ 最高 | 正式发布 |

---

## 🎭 方案1: Mock 模式（推荐）

### 优势
- ✅ **完全免费**
- ✅ **3秒响应**（不用等5-10分钟）
- ✅ **不扣积分**
- ✅ **使用真实的测试视频**
- ✅ **模拟完整流程**（提交 → Webhook → R2转存）

### 启用方法

#### 1. 添加环境变量
在 `.env.local` 添加：
```env
NEXT_PUBLIC_VEO3_MOCK=true
```

#### 2. 重启开发服务器
```bash
npm run dev
```

#### 3. 正常调用 API
```bash
curl -X POST http://localhost:3000/api/veo3/submit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text-to-video",
    "prompt": "A cute cat playing with yarn",
    "model": "veo3_fast"
  }'
```

### Mock 行为
1. **立即返回** `mock_veo3_xxx` 格式的 taskId
2. **3秒后自动触发 Webhook**（模拟 Veo3 回调）
3. 使用 Google 的**免费测试视频**：
   - 720p: [Big Buck Bunny](https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4)
   - 1080p: [Elephants Dream](https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4)
4. **正常扣积分** + **正常退款**（测试积分系统）

### 关闭 Mock
删除或设置为 false：
```env
NEXT_PUBLIC_VEO3_MOCK=false
```

---

## 💡 方案2: 测试用户 + 低积分

### 策略
1. 创建专门的测试账户
2. 只充值少量积分（比如 100 积分 = 2次 veo3_fast）
3. 每次测试前检查积分余额

### 实施步骤
```sql
-- 给测试用户充值 100 积分
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at)
VALUES ('test_credits_001', 'test_user_uuid', 'system_add', 100, NOW());
```

### 测试优先级
1. **优先测试 veo3_fast**（40积分）
2. 只在必要时测试 veo3 Quality（300积分）
3. 1080P 升级单独测试（8积分）

---

## 🔧 方案3: 条件性真实调用

### 策略
只在特定条件下调用真实 API：

```typescript
// 在 submit API 中添加检查
const isMockMode = process.env.NEXT_PUBLIC_VEO3_MOCK === "true";
const isTestUser = user_uuid.startsWith("test_");

// 测试用户 + 非 Mock 模式 = 使用 veo3_fast
if (isTestUser && !isMockMode) {
  model = "veo3_fast"; // 强制使用便宜的模型
}
```

---

## 📊 方案4: 复用已生成的视频

### 策略
保存一些已经生成的视频，在开发时直接使用：

```typescript
// 在测试环境返回历史成功的视频
const CACHED_TEST_VIDEOS = [
  { taskId: "real_task_001", url: "https://..." },
  { taskId: "real_task_002", url: "https://..." },
];
```

---

## 🎯 推荐测试流程

### 阶段1: 前端开发（Mock模式）
```env
NEXT_PUBLIC_VEO3_MOCK=true
```
- ✅ UI 布局
- ✅ 表单验证
- ✅ 状态管理
- ✅ 错误处理
- ✅ 加载动画

**成本**: 0 积分

---

### 阶段2: 接口验证（1-2次真实调用）
```env
NEXT_PUBLIC_VEO3_MOCK=false
```
- ✅ 测试 veo3_fast（40积分 × 1次 = 40积分）
- ✅ 测试 webhook 真实回调
- ✅ 测试 R2 转存

**成本**: 40-80 积分

---

### 阶段3: 完整功能测试
- ✅ 测试 16:9 + 1080P 升级（40 + 8 = 48积分）
- ✅ 测试错误场景（积分退款）
- ✅ 测试历史记录

**成本**: 50-100 积分

---

### 阶段4: 生产验证（可选）
- ✅ veo3 Quality 测试 1次（300积分）

**成本**: 300 积分

---

## 💰 成本估算

| 测试方案 | 总成本 | 说明 |
|----------|--------|------|
| **纯 Mock 开发** | 0积分 | 90% 的开发工作 |
| **基础验证** | 40-80积分 | 接口对接验证 |
| **完整测试** | 150-200积分 | 包含1080P和错误场景 |
| **生产验证** | 500积分 | 完整流程 + Quality模式 |

---

## 🚀 快速开始

### 1. 启用 Mock 模式
```bash
echo "NEXT_PUBLIC_VEO3_MOCK=true" >> .env.local
npm run dev
```

### 2. 测试提交
访问前端页面或调用 API：
```bash
curl -X POST http://localhost:3000/api/veo3/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "type": "text-to-video",
    "prompt": "测试视频",
    "model": "veo3_fast",
    "aspect_ratio": "16:9"
  }'
```

### 3. 查看控制台
应该看到：
```
🎭 [MOCK MODE] Veo3 generateVideo: mock_veo3_1234567890_abc123
🎭 [MOCK MODE] Webhook sent for: mock_veo3_1234567890_abc123
```

### 4. 查询任务状态
```bash
curl http://localhost:3000/api/veo3/status/{task_id}
```

---

## ⚠️ 注意事项

1. **Mock 视频不会真的转存 R2**（避免产生存储费用）
2. **积分仍然会扣除**（测试积分系统）
3. **关闭 Mock 前务必确认**（避免意外扣费）
4. **生产环境务必关闭 Mock**

---

## 🔍 调试技巧

### 检查 Mock 状态
```typescript
console.log("Mock enabled:", process.env.NEXT_PUBLIC_VEO3_MOCK);
```

### 模拟失败场景
修改 `veo3-client.ts`：
```typescript
if (ENABLE_MOCK) {
  // 模拟失败
  setTimeout(() => {
    fetch(params.callBackUrl!, {
      method: "POST",
      body: JSON.stringify({
        code: 500,
        data: { taskId: mockTaskId, errorCode: "MOCK_ERROR" },
        msg: "Mock failure"
      })
    });
  }, 3000);
}
```

---

**推荐：开发阶段全程使用 Mock 模式，只在部署前测试 1-2 次真实调用！** 🎉
