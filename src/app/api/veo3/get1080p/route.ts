import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { findTaskById } from "@/models/veo3";
import { processGet1080pRequest } from "@/services/veo3";
import { get1080pVideo } from "@/lib/veo3-client";
import { supports1080p } from "@/lib/constants/veo3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, index } = body;

    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 验证参数
    if (!task_id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: task_id" },
        { status: 400 }
      );
    }

    // 3. 查询任务
    const task = await findTaskById(task_id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // 4. 验证任务所属
    if (task.user_uuid !== user_uuid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // 5. 检查任务状态
    if (task.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Task is not completed yet",
          status: task.status,
        },
        { status: 400 }
      );
    }

    // 6. 检查是否已经有1080P版本
    if (task.has_1080p) {
      return NextResponse.json(
        {
          success: false,
          error: "1080P version already exists",
          video_1080p_url: task.video_1080p_url,
        },
        { status: 400 }
      );
    }

    // 7. 检查宽高比是否支持1080P
    const input = task.input ? JSON.parse(task.input) : {};
    const aspectRatio = input.aspectRatio || "16:9";

    if (!supports1080p(aspectRatio)) {
      return NextResponse.json(
        {
          success: false,
          error: `1080P upgrade is only available for 16:9 aspect ratio. Current: ${aspectRatio}`,
        },
        { status: 400 }
      );
    }

    // 8. 调用 Veo3 API 获取1080P视频
    let video1080pUrl: string;
    try {
      video1080pUrl = await get1080pVideo(task.request_id, index);
    } catch (veo3Error) {
      console.error("Veo3 get1080p API error:", veo3Error);

      // 检查是否是处理中状态
      if ((veo3Error as any).code === "PROCESSING") {
        return NextResponse.json(
          {
            success: false,
            error: "PROCESSING",
            message: veo3Error instanceof Error ? veo3Error.message : "1080P video is still processing",
          },
          { status: 425 } // 425 Too Early
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to get 1080P video from Veo3 service",
          details: veo3Error instanceof Error ? veo3Error.message : undefined,
        },
        { status: 500 }
      );
    }

    // 9. 处理积分扣除和视频转存
    try {
      const result = await processGet1080pRequest({
        userUuid: user_uuid,
        taskId: task_id,
        video1080pUrl,
      });

      return NextResponse.json({
        success: true,
        video_1080p_url: result.video1080pUrl,
        credits_used: result.creditsUsed,
        remaining_credits: result.remainingCredits,
      });
    } catch (processError) {
      console.error("Process 1080P upgrade error:", processError);

      // 判断是否是积分不足错误
      if (
        processError instanceof Error &&
        processError.message.includes("Insufficient credits")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient credits",
            message: processError.message,
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process 1080P upgrade",
          details:
            processError instanceof Error ? processError.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Veo3 Get1080P API error:", error);
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
