import { NextRequest, NextResponse } from "next/server";
import { findTaskById } from "@/models/upscaler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 1. 查询任务记录
    const task = await findTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 2. 检查任务状态
    if (task.status === "pending" || task.status === "processing") {
      return NextResponse.json(
        {
          success: false,
          task_id: task.task_id,
          error: "Task is still processing",
          message: "Please check status first",
        },
        { status: 202 }
      );
    }

    // 3. 如果任务失败
    if (task.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          task_id: task.task_id,
          error: task.error_message || "Task failed",
          credits_refunded: task.credits_refunded,
        },
        { status: 400 }
      );
    }

    // 4. 任务成功，返回结果
    if (task.status === "completed") {
      let result = null;
      if (task.result) {
        try {
          result = JSON.parse(task.result);
        } catch (e) {
          console.error("Failed to parse task result:", e);
          result = task.result;
        }
      }

      // 解析输入参数
      let input = null;
      if (task.input) {
        try {
          input = JSON.parse(task.input);
        } catch (e) {
          console.error("Failed to parse task input:", e);
          input = task.input;
        }
      }

      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        request_id: task.request_id,
        provider: task.provider,
        input: input,
        result: result,
        credits_used: task.credits_used,
        completed_at: task.updated_at,
      });
    }

    // 5. 未知状态
    return NextResponse.json(
      {
        success: false,
        task_id: task.task_id,
        error: "Unknown task status",
        status: task.status,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Upscaler Result API error:", error);
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