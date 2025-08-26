import { NextRequest, NextResponse } from "next/server";
import { findTaskById } from "@/models/nano-banana";
import { fal } from "@fal-ai/client";

// 配置客户端使用proxy
fal.config({
  proxyUrl: "/api/fal/proxy",
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 1. 查询任务记录获取 request_id 和 type
    const task = await findTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 2. 根据类型确定 endpoint
    const endpoint =
      task.type === "text-to-image"
        ? "fal-ai/nano-banana"
        : "fal-ai/nano-banana/edit";

    // 3. 查询 fal.ai 状态
    try {
      const status = await fal.queue.status(endpoint, {
        requestId: task.request_id,
        logs: true,
      });

      // 4. 直接返回 fal.ai 的状态
      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        ...status,
      });
    } catch (falError) {
      console.error("Fal API error:", falError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get status from fal.ai",
          details: falError instanceof Error ? falError.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Status API error:", error);
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
