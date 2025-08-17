import { NextRequest, NextResponse } from "next/server";
import { fluxAPI } from "@/lib/flux-api";
import { getUserUuid } from "@/services/user";
import { 
  checkUserCredits, 
  decreaseCredits, 
  CreditsTransType, 
  CreditsAmount 
} from "@/services/credit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, size, count } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check authentication
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Determine credits cost based on model
    const modelType = model || "flux-kontext-pro";
    const requiredCredits = modelType === "flux-kontext-max" 
      ? CreditsAmount.FluxMaxCost 
      : CreditsAmount.FluxProCost;

    // Check if user has enough credits
    const creditCheck = await checkUserCredits(user_uuid, requiredCredits);
    if (!creditCheck.hasEnough) {
      return NextResponse.json(
        { 
          success: false, 
          error: "insufficient_credits",
          message: `Insufficient credits. ${modelType === "flux-kontext-max" ? "Max" : "Pro"} mode requires ${requiredCredits} credits, but you only have ${creditCheck.currentCredits} credits left.`,
          requiredCredits,
          currentCredits: creditCheck.currentCredits
        },
        { status: 402 }
      );
    }

    // Text to Image - Generate
    // const result = await fluxAPI.generateImage(prompt, {
    //   model: model || "flux-kontext-pro",
    //   size,
    //   count: count || 1,
    //   // No callback needed, we'll poll for results
    //   callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/flux/callback`,
    // });

    // if (result.error) {
    //   return NextResponse.json(
    //     { success: false, error: result.error },
    //     { status: 400 }
    //   );
    // }

    const result = {
      success: true,
      task_id: "dc6576f7-6775-4749-b20f-39d0ae53aa80",
      trace_id: undefined,
    };

    console.log("generate result", result);

    // If generation was successful, decrease user credits
    if (result.success && result.task_id) {
      try {
        await decreaseCredits({
          user_uuid,
          trans_type: CreditsTransType.FluxGenerate,
          credits: requiredCredits,
        });
        console.log(`Successfully deducted ${requiredCredits} credits for user ${user_uuid}`);
      } catch (error) {
        console.error("Failed to deduct credits:", error);
        // Note: Generation already succeeded, so we don't return error here
        // But we should log this for monitoring
      }
    }

    // If we got a task_id, it means the task is async
    if (result.task_id) {
      return NextResponse.json({
        success: true,
        task_id: result.task_id,
        trace_id: result.trace_id,
        creditsDeducted: requiredCredits,
        remainingCredits: creditCheck.currentCredits - requiredCredits,
        // data will be available via callback or polling
      });
    }
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "server_error",
          message: "Failed to generate image",
        },
      },
      { status: 500 }
    );
  }
}
