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

// 频率限制存储 (简单内存缓存)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期的频率限制记录
const cleanupRateLimit = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// 检查频率限制
const checkRateLimit = (identifier: string): { allowed: boolean; error?: string; resetTime?: number } => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分钟窗口
  const maxRequests = 30; // 每分钟最多30次

  cleanupRateLimit();

  const record = rateLimitStore.get(identifier);

  if (record) {
    if (now < record.resetTime) {
      if (record.count >= maxRequests) {
        return {
          allowed: false,
          error: `Rate limit exceeded. Maximum ${maxRequests} requests per minute.`,
          resetTime: record.resetTime
        };
      }
      record.count++;
    } else {
      // 重置计数
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    }
  } else {
    // 首次请求
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
  }

  return { allowed: true };
};

// 验证文件参数
const validateFileParams = (filename: string | null, contentType: string | null, fileSize: string | null) => {
  // 文件名验证
  if (!filename || filename.trim() === "") {
    return { valid: false, error: "Filename is required", statusCode: 400 };
  }

  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { valid: false, error: "Invalid filename", statusCode: 400 };
  }

  // 文件类型验证
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!contentType || !allowedTypes.includes(contentType)) {
    return { valid: false, error: "Unsupported file type. Only JPEG, PNG, and WEBP are allowed.", statusCode: 400 };
  }

  // 文件大小验证
  const size = parseInt(fileSize || "0");
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (size <= 0) {
    return { valid: false, error: "File size must be specified", statusCode: 400 };
  }
  if (size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit", statusCode: 413 };
  }

  return { valid: true };
};

// Get presigned URL for client-side upload
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");
    const contentType = searchParams.get("contentType");
    const fileSize = searchParams.get("fileSize");

    // 获取客户端标识符（IP地址）
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 1. 频率限制检查
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error,
          retryAfter: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // 2. 文件参数验证
    const validationResult = validateFileParams(filename, contentType, fileSize);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error
        },
        { status: validationResult.statusCode }
      );
    }

    // 3. 生成预签名URL（15分钟有效期）
    const { url, key } = await r2Upload.getPresignedUploadUrl(
      filename!,
      contentType!,
      900 // 15分钟 = 900秒
    );

    return NextResponse.json({
      success: true,
      uploadUrl: url,
      key,
      publicUrl: r2Upload.getPublicUrl(key),
      expiresIn: 900
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