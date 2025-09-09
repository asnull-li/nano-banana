import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { processUpscalerSubmit } from "@/services/upscaler";
import { submitUpscaleTask } from "@/lib/kie-upscaler-client";
import { 
  UpscalerInput, 
  MIN_SCALE, 
  MAX_SCALE, 
  DEFAULT_SCALE 
} from "@/lib/constants/upscaler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;

    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 验证参数
    if (!input || typeof input !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: input",
        },
        { status: 400 }
      );
    }

    const { image, scale = DEFAULT_SCALE, face_enhance = false } = input as UpscalerInput;

    // 验证图片URL
    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: input.image",
        },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(image);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image URL format",
        },
        { status: 400 }
      );
    }

    // 验证scale参数
    if (typeof scale !== 'number' || scale < MIN_SCALE || scale > MAX_SCALE) {
      return NextResponse.json(
        {
          success: false,
          error: `Scale must be a number between ${MIN_SCALE} and ${MAX_SCALE}`,
        },
        { status: 400 }
      );
    }

    // 验证face_enhance参数
    if (typeof face_enhance !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: "face_enhance must be a boolean value",
        },
        { status: 400 }
      );
    }

    // 3. 生成webhook URL
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://similarly-just-caiman.ngrok-free.app/api/upscaler/kie/webhook"
        : "https://nanobanana.org/api/upscaler/kie/webhook";

    // 4. 提交到 KIE API
    let request_id: string;
    try {
      request_id = await submitUpscaleTask(
        image,
        scale,
        face_enhance,
        webhookUrl
      );
    } catch (kieError) {
      console.error("KIE Upscaler API error:", kieError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit to KIE upscaler service",
          details: kieError instanceof Error ? kieError.message : undefined,
        },
        { status: 500 }
      );
    }

    // 5. 处理任务创建和积分扣除
    try {
      const result = await processUpscalerSubmit({
        userUuid: user_uuid,
        input: {
          image,
          scale,
          face_enhance,
        },
        requestId: request_id,
        provider: 'kie',
      });

      return NextResponse.json({
        success: true,
        task_id: result.taskId,
        request_id: result.requestId,
        credits_used: result.creditsUsed,
        remaining_credits: result.remainingCredits,
      });
    } catch (processError) {
      // 如果处理失败，记录错误但返回任务ID（任务已提交到 KIE）
      console.error("Process error:", processError);

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
          error: "Failed to process request",
          details:
            processError instanceof Error ? processError.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upscaler Summit API error:", error);
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