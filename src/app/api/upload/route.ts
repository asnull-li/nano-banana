import { NextRequest, NextResponse } from "next/server";
import { r2Upload } from "@/lib/r2-upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const url = await r2Upload.uploadFile(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to upload file" 
      },
      { status: 500 }
    );
  }
}

// Get presigned URL for client-side upload
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename") || "image.png";
    const contentType = searchParams.get("contentType") || "image/png";

    const { url, key } = await r2Upload.getPresignedUploadUrl(
      filename,
      contentType
    );

    return NextResponse.json({
      success: true,
      uploadUrl: url,
      key,
      publicUrl: r2Upload.getPublicUrl(key),
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate upload URL" 
      },
      { status: 500 }
    );
  }
}