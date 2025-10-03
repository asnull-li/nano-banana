import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { findTaskById } from "@/models/veo3";
import { supports1080p } from "@/lib/constants/veo3";

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

    // 5. 检查是否支持1080P升级
    const aspectRatio = input.aspectRatio || "16:9";
    const canUpgradeTo1080p = supports1080p(aspectRatio) && !task.has_1080p;

    // 6. 返回任务状态
    return NextResponse.json({
      success: true,
      task: {
        task_id: task.task_id,
        status: task.status,
        type: task.type,
        model: task.model,
        input: {
          prompt: input.prompt,
          aspect_ratio: aspectRatio,
          watermark: input.watermark,
        },
        result: result
          ? {
              resolution: result.resolution,
              result_urls: result.resultUrls,
              origin_urls: result.originUrls,
            }
          : null,
        video_720p_url: task.video_720p_url,
        video_1080p_url: task.video_1080p_url,
        has_1080p: task.has_1080p,
        can_upgrade_to_1080p: canUpgradeTo1080p,
        credits_used: task.credits_used,
        error_message: task.error_message,
        error_code: task.error_code,
        created_at: task.created_at,
        completed_at: task.completed_at,
      },
    });
  } catch (error) {
    console.error("Veo3 Status API error:", error);
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
