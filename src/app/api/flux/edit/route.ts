import { NextRequest, NextResponse } from "next/server";
import { fluxAPI } from "@/lib/flux-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageUrl, model } = body;

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Prompt and imageUrl are required" },
        { status: 400 }
      );
    }

    // Image to Image - Edit
    // const result = await fluxAPI.editImage(imageUrl, prompt, {
    //   model: model || "flux-kontext-pro",
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
      task_id: "4c1ee7ff-340d-415a-a60e-59169f0e92ad",
      trace_id: undefined,
    };

    // If we got a task_id, it means the task is async
    console.log("edit result", result);
    if (result.task_id) {
      return NextResponse.json({
        success: true,
        task_id: result.task_id,
        trace_id: result.trace_id,
        // data will be available via callback or polling
      });
    }
  } catch (error) {
    console.error("Edit API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "server_error",
          message: "Failed to edit image",
        },
      },
      { status: 500 }
    );
  }
}
