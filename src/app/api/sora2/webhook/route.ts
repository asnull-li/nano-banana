import { NextRequest, NextResponse } from "next/server";
import { handleSora2WebhookCallback } from "@/services/sora2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Sora 2 webhook received:", {
      code: body.code,
      taskId: body.data?.taskId,
      state: body.data?.state,
    });

    // 处理 webhook 回调
    const result = await handleSora2WebhookCallback(body);

    if (!result.success) {
      console.error("Sora 2 webhook processing failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Sora 2 Webhook API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
