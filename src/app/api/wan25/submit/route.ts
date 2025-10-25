import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { processSubmitRequest } from "@/services/wan25";
import { generateWan25Video } from "@/lib/wan25-client";
import {
  Wan25TaskType,
  Wan25AspectRatio,
  Wan25Duration,
  Wan25Resolution,
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_NEGATIVE_PROMPT_LENGTH,
  DEFAULT_DURATION,
  DEFAULT_RESOLUTION,
  DEFAULT_ASPECT_RATIO,
} from "@/lib/constants/wan25";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      prompt,
      duration = DEFAULT_DURATION,
      resolution = DEFAULT_RESOLUTION,
      image_url,
      aspect_ratio = DEFAULT_ASPECT_RATIO,
      negative_prompt,
      enable_prompt_expansion = true,
      seed,
    } = body;

    // 1. 验证用户身份
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. 验证必需参数
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
    if (type === "image-to-video" && !image_url) {
      return NextResponse.json(
        {
          success: false,
          error: "image_url required for image-to-video mode",
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

    // 验证负面提示词长度
    if (
      negative_prompt &&
      negative_prompt.length > MAX_NEGATIVE_PROMPT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Negative prompt must not exceed ${MAX_NEGATIVE_PROMPT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // 验证时长参数
    if (!["5", "10"].includes(duration)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid duration. Must be '5' or '10'",
        },
        { status: 400 }
      );
    }

    // 验证分辨率参数
    if (!["720p", "1080p"].includes(resolution)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid resolution. Must be '720p' or '1080p'",
        },
        { status: 400 }
      );
    }

    // 验证宽高比参数 (仅 text-to-video)
    if (
      type === "text-to-video" &&
      aspect_ratio &&
      !["16:9", "9:16", "1:1"].includes(aspect_ratio)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid aspect_ratio. Must be '16:9', '9:16', or '1:1'",
        },
        { status: 400 }
      );
    }

    // 3. 生成 webhook URL
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://similarly-just-caiman.ngrok-free.app/api/wan25/webhook"
        : "https://nanobanana.org/api/wan25/webhook";

    // 4. 提交到 Wan 2.5 API
    let request_id: string;
    try {
      console.log(`[Wan25 Submit] Calling KIE API...`);
      request_id = await generateWan25Video({
        type: type as Wan25TaskType,
        prompt,
        duration: duration as Wan25Duration,
        resolution: resolution as Wan25Resolution,
        imageUrl: type === "image-to-video" ? image_url : undefined,
        aspectRatio: aspect_ratio as Wan25AspectRatio,
        negativePrompt: negative_prompt,
        enablePromptExpansion: enable_prompt_expansion,
        seed,
        callBackUrl: webhookUrl,
      });
      console.log(`[Wan25 Submit] KIE API returned request_id: ${request_id}`);
    } catch (wan25Error) {
      console.error("[Wan25 Submit] Wan 2.5 API error:", wan25Error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit to Wan 2.5 video generation service",
          details: wan25Error instanceof Error ? wan25Error.message : undefined,
        },
        { status: 500 }
      );
    }

    // 5. 处理任务创建和积分扣除
    try {
      console.log(`[Wan25 Submit] Creating database record with request_id: ${request_id} for user: ${user_uuid}`);
      const result = await processSubmitRequest({
        userUuid: user_uuid,
        type: type as Wan25TaskType,
        prompt,
        duration: duration as Wan25Duration,
        resolution: resolution as Wan25Resolution,
        imageUrl: type === "image-to-video" ? image_url : undefined,
        aspectRatio: aspect_ratio as Wan25AspectRatio,
        negativePrompt: negative_prompt,
        enablePromptExpansion: enable_prompt_expansion,
        seed,
        requestId: request_id,
      });
      console.log(`[Wan25 Submit] Database record created successfully`);

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
    console.error("Wan 2.5 Submit API error:", error);
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
