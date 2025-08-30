import { NextRequest, NextResponse } from "next/server";
import { checkCode } from "@/services/verifyCode";
import { z } from "zod";

// 请求体验证
const verifyCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    // 验证请求体
    const body = await req.json();
    const validation = verifyCodeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { email, code } = validation.data;

    // 检查验证码（不删除）
    const result = await checkCode(email, code);
    
    if (!result.success) {
      // 返回具体的错误类型
      let errorMessage = "Verification failed";
      let errorCode = result.error;
      
      if (result.error === "INVALID_CODE") {
        errorMessage = "Invalid verification code";
      } else if (result.error === "CODE_EXPIRED") {
        errorMessage = "Verification code expired or not found";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorCode: errorCode 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code is valid",
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}