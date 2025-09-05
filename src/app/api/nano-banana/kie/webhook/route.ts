import { NextRequest, NextResponse } from "next/server";
import { handleKieWebhookCallback } from "@/services/kie";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析webhook数据
    const body = await request.json();
    console.log("Kie webhook received:", JSON.stringify(body, null, 2));

    // 2. 验证必需字段
    if (!body.data || !body.data.taskId) {
      console.error("Kie webhook missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. 处理webhook
    const result = await handleKieWebhookCallback(body);

    // 4. 返回响应
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Kie webhook error:", error);
    // 返回成功状态以避免重试
    // Kie.ai 可能会重试失败的webhook
    return NextResponse.json({
      success: true,
      message: "Webhook processed with error",
      error: error instanceof Error ? error.message : undefined,
    });
  }
}

// 支持GET请求用于测试webhook是否可访问
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Kie webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}