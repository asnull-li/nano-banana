import { NextRequest, NextResponse } from "next/server";

const FLUX_TASKS_URL = "https://api.acedata.cloud/flux/tasks";
const FLUX_API_KEY = process.env.FLUX_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID is required" },
        { status: 400 }
      );
    }

    console.log(`Retrieving task status for: ${taskId}`);

    // Call Flux API to retrieve task status
    const response = await fetch(FLUX_TASKS_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${FLUX_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        action: "retrieve",
        id: taskId,
      }),
    });

    const data = await response.json();
    // console.log(`Task ${taskId} status:`, data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to retrieve task status",
        },
        { status: response.status }
      );
    }

    // Check if task is completed by looking for response.data
    if (data.response && data.response.data) {
      return NextResponse.json({
        success: true,
        completed: true,
        data: data.response.data,
      });
    }

    // If no response.data, task is still processing
    return NextResponse.json({
      success: true,
      completed: false,
      status: "processing",
      progress: data.progress,
    });
  } catch (error) {
    console.error("Task retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve task status",
      },
      { status: 500 }
    );
  }
}
