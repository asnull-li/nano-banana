import { NextRequest, NextResponse } from "next/server";
import { findTaskById } from "@/models/upscaler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 1. 从数据库查询任务记录
    const task = await findTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 2. 解析输入参数
    let input = null;
    if (task.input) {
      try {
        input = JSON.parse(task.input);
      } catch (e) {
        console.error("Failed to parse task input:", e);
        input = task.input;
      }
    }

    // 3. 根据任务状态返回不同响应
    if (task.status === "pending" || task.status === "processing") {
      // 任务处理中
      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        status: task.status,
        message: "Task is being processed",
        input: input,
        provider: task.provider,
        credits_used: task.credits_used,
      });
    } else if (task.status === "completed") {
      // 任务已完成，返回结果
      let result = null;
      if (task.result) {
        try {
          result = JSON.parse(task.result);
        } catch (e) {
          console.error("Failed to parse task result:", e);
          result = task.result;
        }
      }

      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        status: task.status,
        input: input,
        provider: task.provider,
        result: result,
        credits_used: task.credits_used,
        completed_at: task.updated_at,
      });
    } else if (task.status === "failed") {
      // 任务失败
      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        status: task.status,
        input: input,
        provider: task.provider,
        error: task.error_message || "Task failed",
        credits_used: task.credits_used,
        credits_refunded: task.credits_refunded,
      });
    } else {
      // 未知状态
      return NextResponse.json({
        success: true,
        task_id: task.task_id,
        status: task.status,
        input: input,
        provider: task.provider,
        message: "Unknown task status",
      });
    }
  } catch (error) {
    console.error("Upscaler Status API error:", error);
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