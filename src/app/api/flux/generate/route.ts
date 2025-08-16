import { NextRequest, NextResponse } from "next/server";
import { fluxAPI } from "@/lib/flux-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, size, count, mode } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
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

    // If we got a task_id, it means the task is async
    if (result.task_id) {
      return NextResponse.json({
        success: true,
        task_id: result.task_id,
        trace_id: result.trace_id,
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
