import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { findTasksByUser } from "@/models/veo3";

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
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100
    );

    // 3. 查询用户的任务历史
    const tasks = await findTasksByUser(user_uuid, limit);

    // 4. 格式化返回数据
    const formattedTasks = tasks.map((task) => {
      const input = task.input ? JSON.parse(task.input) : {};
      const result = task.result ? JSON.parse(task.result) : null;

      return {
        task_id: task.task_id,
        status: task.status,
        type: task.type,
        model: task.model,
        input: {
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio,
          has_image: !!input.imageUrls,
        },
        video_720p_url: task.video_720p_url,
        video_1080p_url: task.video_1080p_url,
        has_1080p: task.has_1080p,
        credits_used: task.credits_used,
        error_message: task.error_message,
        created_at: task.created_at,
        completed_at: task.completed_at,
      };
    });

    return NextResponse.json({
      success: true,
      tasks: formattedTasks,
      total: formattedTasks.length,
    });
  } catch (error) {
    console.error("Veo3 History API error:", error);
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
