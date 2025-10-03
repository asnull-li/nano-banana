import { NextRequest, NextResponse } from "next/server";
import { handleVeo3WebhookCallback } from "@/services/veo3";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析 webhook 数据
    const body = await request.json();
    console.log("Veo3 webhook received:", JSON.stringify(body, null, 2));

    // 2. 验证必需字段
    if (!body.data || !body.data.taskId) {
      console.error("Veo3 webhook missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. 处理 webhook
    const result = await handleVeo3WebhookCallback(body);

    // 4. 返回响应
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Unknown error" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Veo3 webhook error:", error);
    // 返回成功状态以避免重试
    // Veo3 可能会重试失败的 webhook
    return NextResponse.json({
      success: true,
      message: "Webhook processed with error",
      error: error instanceof Error ? error.message : undefined,
    });
  }
}

// 支持 GET 请求用于测试 webhook 是否可访问
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Veo3 webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
