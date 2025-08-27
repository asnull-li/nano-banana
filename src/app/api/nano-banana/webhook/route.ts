import { NextRequest, NextResponse } from "next/server";
import { handleWebhookCallback } from "@/services/nano-banana";

export async function POST(request: NextRequest) {
  try {
    // 1. 解析webhook数据
    const body = await request.json();
    console.log("Webhook received:", {
      request_id: body.request_id,
      status: body.status,
      timestamp: new Date().toISOString(),
    });
    console.log("Full webhook body:", JSON.stringify(body, null, 2));

    // 2. 验证必需字段
    if (!body.request_id) {
      console.error("Webhook missing request_id");
      return NextResponse.json(
        { success: false, error: "Missing request_id" },
        { status: 400 }
      );
    }

    // 3. 处理webhook
    const result = await handleWebhookCallback({
      requestId: body.request_id,
      status: body.status,
      data: body.payload, // 修复: 使用 payload 而不是 data
      error: body.error,
    });

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
    console.error("Webhook error:", error);
    // 返回成功状态以避免重试
    // fal.ai会重试失败的webhook
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
    message: "Nano Banana webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
