import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { findTasksByUser } from "@/models/wan25";

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // 3. 查询用户的任务列表
    const tasks = await findTasksByUser(user_uuid, limit);

    // 4. 映射任务数据
    const mappedTasks = tasks.map((task) => {
      const input = task.input ? JSON.parse(task.input) : {};
      const result = task.result ? JSON.parse(task.result) : null;

      // 映射状态
      let frontendStatus = task.status;
      if (task.status === "waiting") {
        frontendStatus = "processing";
      } else if (task.status === "success") {
        frontendStatus = "completed";
      } else if (task.status === "fail") {
        frontendStatus = "failed";
      }

      return {
        task_id: task.task_id,
        status: frontendStatus,
        type: task.type,
        input: {
          prompt: input.prompt,
          duration: input.duration,
          resolution: input.resolution,
          aspect_ratio: input.aspect_ratio,
          image_url: input.image_url,
          negative_prompt: input.negative_prompt,
          enable_prompt_expansion: input.enable_prompt_expansion,
          seed: input.seed,
        },
        video_url: task.video_url,
        credits_used: task.credits_used,
        credits_refunded: task.credits_refunded || 0,
        error_message: task.error_message,
        created_at: task.created_at,
        completed_at: task.completed_at,
      };
    });

    return NextResponse.json({
      success: true,
      tasks: mappedTasks,
    });
  } catch (error) {
    console.error("Wan 2.5 History API error:", error);
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
