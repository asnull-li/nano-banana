import { NextRequest, NextResponse } from "next/server";
import { transferExternalImageToR2 } from "@/services/aws/r2";

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
    console.log(`Task ${taskId} status:`, data);

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
      // Transfer images to R2 before returning
      let processedData = data.response.data;

      try {
        if (Array.isArray(processedData)) {
          // Process each image in the array
          processedData = await Promise.all(
            processedData.map(async (item: any) => {
              if (item.image_url) {
                console.log(`Transferring image to R2: ${item.image_url}`);
                try {
                  const r2Url = await transferExternalImageToR2(item.image_url);
                  console.log(`Image transferred successfully to: ${r2Url}`);
                  return {
                    ...item,
                    image_url: r2Url,
                  };
                } catch (transferError) {
                  console.error(`Failed to transfer image: ${transferError}`);
                  // Return original URL if transfer fails
                  return item;
                }
              }
              return item;
            })
          );
        }
      } catch (error) {
        console.error("Error processing images for R2 transfer:", error);
        // Continue with original data if transfer fails
      }

      return NextResponse.json({
        success: true,
        completed: true,
        data: processedData,
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
