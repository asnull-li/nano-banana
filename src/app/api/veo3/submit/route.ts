import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { processSubmitRequest } from "@/services/veo3";
import { generateVideo } from "@/lib/veo3-client";
import {
  Veo3Model,
  Veo3TaskType,
  AspectRatio,
  GenerationType,
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_IMAGE_URLS,
  DEFAULT_VEO3_MODEL,
  DEFAULT_ASPECT_RATIO,
  getImageUrlsLimit,
  validateGenerationType,
} from "@/lib/constants/veo3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      model = DEFAULT_VEO3_MODEL,
      prompt,
      image_urls,
      aspect_ratio = DEFAULT_ASPECT_RATIO,
      watermark,
      seeds,
      enable_fallback = false,
      enable_translation = true,
      generation_type,
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

    // 验证模型
    if (!["veo3", "veo3_fast"].includes(model)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid model. Must be 'veo3' or 'veo3_fast'",
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

    // 检查图片数量限制（根据 generationType 动态判断）
    if (type === "image-to-video") {
      // 校验 generationType 合法性
      if (
        generation_type &&
        !["FIRST_AND_LAST_FRAMES_2_VIDEO", "REFERENCE_2_VIDEO"].includes(generation_type)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid generation_type. Must be 'FIRST_AND_LAST_FRAMES_2_VIDEO' or 'REFERENCE_2_VIDEO'",
          },
          { status: 400 }
        );
      }

      // 校验图片数量
      const limits = getImageUrlsLimit(generation_type as GenerationType);
      const imageCount = image_urls?.length || 0;

      if (imageCount < limits.min || imageCount > limits.max) {
        return NextResponse.json(
          {
            success: false,
            error: `${generation_type || 'FIRST_AND_LAST_FRAMES_2_VIDEO'} mode requires ${limits.min}-${limits.max} image(s)`,
          },
          { status: 400 }
        );
      }

      // 校验 REFERENCE_2_VIDEO 的模型和宽高比限制
      if (generation_type === "REFERENCE_2_VIDEO") {
        const validation = validateGenerationType(
          generation_type,
          model as Veo3Model,
          aspect_ratio as AspectRatio
        );
        if (!validation.valid) {
          return NextResponse.json(
            {
              success: false,
              error: validation.error,
            },
            { status: 400 }
          );
        }
      }
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
    if (aspect_ratio && !["16:9", "9:16", "Auto"].includes(aspect_ratio)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid aspect_ratio. Must be '16:9', '9:16', or 'Auto'",
        },
        { status: 400 }
      );
    }

    // 3. 生成 webhook URL
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://similarly-just-caiman.ngrok-free.app/api/veo3/webhook"
        : "https://nanobanana.org/api/veo3/webhook";

    // 4. 提交到 Veo3 API
    let request_id: string;
    try {
      request_id = await generateVideo({
        prompt,
        model: model as Veo3Model,
        imageUrls: type === "image-to-video" ? image_urls : undefined,
        aspectRatio: aspect_ratio as AspectRatio,
        watermark,
        seeds,
        callBackUrl: webhookUrl,
        enableFallback: enable_fallback,
        enableTranslation: enable_translation,
        generationType: generation_type as GenerationType,
      });
    } catch (veo3Error) {
      console.error("Veo3 API error:", veo3Error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit to Veo3 video generation service",
          details: veo3Error instanceof Error ? veo3Error.message : undefined,
        },
        { status: 500 }
      );
    }

    // 5. 处理任务创建和积分扣除
    try {
      const result = await processSubmitRequest({
        userUuid: user_uuid,
        type: type as Veo3TaskType,
        model: model as Veo3Model,
        prompt,
        imageUrls: type === "image-to-video" ? image_urls : undefined,
        aspectRatio: aspect_ratio as AspectRatio,
        watermark,
        seeds,
        requestId: request_id,
        generationType: generation_type as GenerationType,
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
    console.error("Veo3 Submit API error:", error);
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
