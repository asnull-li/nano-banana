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
    const endpoint = task.type === 'text-to-image' 
      ? "fal-ai/nano-banana" 
      : "fal-ai/nano-banana/edit";

    // 3. 获取 fal.ai 结果
    try {
      const result = await fal.queue.result(endpoint, {
        requestId: task.request_id
      });
      
      // 4. 直接返回结果
      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        request_id: task.request_id,
        ...result
      });
    } catch (falError: any) {
      // 如果结果还没准备好，fal.ai 会返回 404
      if (falError?.status === 404 || falError?.message?.includes('not found')) {
        return NextResponse.json({
          success: false,
          task_id: task.task_id,
          error: "Result not ready yet",
          message: "Please check status first"
        }, { status: 404 });
      }

      console.error("Fal API error:", falError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get result from fal.ai",
          details: falError instanceof Error ? falError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}