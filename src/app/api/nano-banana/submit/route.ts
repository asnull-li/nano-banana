import { NextRequest, NextResponse } from "next/server";
import { getUserUuid } from "@/services/user";
import { processSubmitRequest } from "@/services/nano-banana";
import { submitTextToImage, submitImageEdit } from "@/lib/nano-banana-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, image_urls, num_images = 1 } = body;

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

    if (!["text-to-image", "image-to-image"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid type. Must be 'text-to-image' or 'image-to-image'",
        },
        { status: 400 }
      );
    }

    if (
      type === "image-to-image" &&
      (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "image_urls required for image-to-image mode",
        },
        { status: 400 }
      );
    }

    if (type === "image-to-image" && image_urls.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 images allowed for image-to-image mode",
        },
        { status: 400 }
      );
    }

    if (num_images < 1 || num_images > 4) {
      return NextResponse.json(
        { success: false, error: "num_images must be between 1 and 4" },
        { status: 400 }
      );
    }

    if (prompt.length < 3 || prompt.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt must be between 3 and 5000 characters",
        },
        { status: 400 }
      );
    }

    // 3. 生成webhook URL
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://similarly-just-caiman.ngrok-free.app/api/nano-banana/webhook"
        : "https://nanobanana.org/api/nano-banana/webhook";

    // 4. 提交到fal.ai
    let request_id: string;
    try {
      if (type === "text-to-image") {
        request_id = await submitTextToImage(prompt, num_images, webhookUrl);
      } else {
        request_id = await submitImageEdit(
          prompt,
          image_urls,
          num_images,
          webhookUrl
        );
      }
    } catch (falError) {
      console.error("Fal API error:", falError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit to image generation service",
          details: falError instanceof Error ? falError.message : undefined,
        },
        { status: 500 }
      );
    }

    // 5. 处理任务创建和积分扣除
    try {
      const result = await processSubmitRequest({
        userUuid: user_uuid,
        type,
        prompt,
        imageUrls: image_urls,
        numImages: num_images,
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
      // 如果处理失败，记录错误但返回任务ID（任务已提交到fal.ai）
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
    console.error("Submit API error:", error);
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
