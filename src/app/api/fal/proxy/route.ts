import { route } from "@fal-ai/server-proxy/nextjs";

// 导出 GET 和 POST 处理器，用于代理 fal.ai 请求
// 这样可以保护 API 密钥不暴露给客户端
export const { GET, POST } = route;