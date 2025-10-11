import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { findTaskById } from "@/models/sora2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 查询任务
    const task = await findTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 3. 验证任务所属
    if (task.user_uuid !== user_uuid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // 4. 解析输入和结果
    const input = task.input ? JSON.parse(task.input) : {};
    const result = task.result ? JSON.parse(task.result) : null;

    // 5. 映射 KIE Jobs API 状态到前端状态
    // KIE: waiting -> Frontend: processing
    // KIE: success -> Frontend: completed
    // KIE: fail -> Frontend: failed
    let frontendStatus = task.status;
    if (task.status === "waiting") {
      frontendStatus = "processing";
    } else if (task.status === "success") {
      frontendStatus = "completed";
    } else if (task.status === "fail") {
      frontendStatus = "failed";
    }

    // 6. 返回任务状态
    return NextResponse.json({
      success: true,
      task: {
        task_id: task.task_id,
        status: frontendStatus,
        type: task.type,
        input: {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio,
          remove_watermark: input.removeWatermark,
        },
        result: result
          ? {
              resultUrls: result.resultUrls,
            }
          : null,
        video_url: task.video_url,
        credits_used: task.credits_used,
        error_message: task.error_message,
        error_code: task.error_code,
        created_at: task.created_at,
        completed_at: task.completed_at,
      },
    });
  } catch (error) {
    console.error("Sora 2 Status API error:", error);
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
