import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { processSubmitRequest } from "@/services/sora2";
import { generateSora2Video } from "@/lib/sora2-client";
import {
  Sora2TaskType,
  Sora2AspectRatio,
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_IMAGE_URLS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_REMOVE_WATERMARK,
} from "@/lib/constants/sora2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      prompt,
      image_urls,
      aspect_ratio = DEFAULT_ASPECT_RATIO,
      remove_watermark = DEFAULT_REMOVE_WATERMARK,
    } = body;

    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 验证参数
    if (!type || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: type and prompt",
        },
        { status: 400 }
      );
    }

    // 验证任务类型
    if (!["text-to-video", "image-to-video"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Must be 'text-to-video' or 'image-to-video'",
        },
        { status: 400 }
      );
    }

    // 验证 image-to-video 模式的图片 URL
    if (
      type === "image-to-video" &&
      (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "image_urls required for image-to-video mode",
        },
        { status: 400 }
      );
    }

    // 检查图片数量限制
    if (type === "image-to-video" && image_urls.length > MAX_IMAGE_URLS) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${MAX_IMAGE_URLS} image allowed for image-to-video mode`,
        },
        { status: 400 }
      );
    }

    // 验证提示词长度
    if (
      prompt.length < MIN_PROMPT_LENGTH ||
      prompt.length > MAX_PROMPT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Prompt must be between ${MIN_PROMPT_LENGTH} and ${MAX_PROMPT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // 验证宽高比
    if (aspect_ratio && !["landscape", "portrait"].includes(aspect_ratio)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid aspect_ratio. Must be 'landscape' or 'portrait'",
        },
        { status: 400 }
      );
    }

    // 3. 生成 webhook URL
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://similarly-just-caiman.ngrok-free.app/api/sora2/webhook"
        : "https://nanobanana.org/api/sora2/webhook";

    // 4. 提交到 Sora 2 API
    let request_id: string;
    try {
      request_id = await generateSora2Video({
        type: type as Sora2TaskType,
        prompt,
        imageUrls: type === "image-to-video" ? image_urls : undefined,
        aspectRatio: aspect_ratio as Sora2AspectRatio,
        removeWatermark: remove_watermark,
        callBackUrl: webhookUrl,
      });
    } catch (sora2Error) {
      console.error("Sora 2 API error:", sora2Error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit to Sora 2 video generation service",
          details: sora2Error instanceof Error ? sora2Error.message : undefined,
        },
        { status: 500 }
      );
    }

    // 5. 处理任务创建和积分扣除
    try {
      const result = await processSubmitRequest({
        userUuid: user_uuid,
        type: type as Sora2TaskType,
        prompt,
        imageUrls: type === "image-to-video" ? image_urls : undefined,
        aspectRatio: aspect_ratio as Sora2AspectRatio,
        removeWatermark: remove_watermark,
        requestId: request_id,
      });

      return NextResponse.json({
        success: true,
        task_id: result.taskId,
        request_id: result.requestId,
        credits_used: result.creditsUsed,
        remaining_credits: result.remainingCredits,
      });
    } catch (processError) {
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
    console.error("Sora 2 Submit API error:", error);
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
