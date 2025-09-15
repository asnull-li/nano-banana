import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/smtp";
import {
  generateVerifyCode,
  storeVerifyCode,
  canSendCode,
} from "@/services/verifyCode";
import { z } from "zod";
import isTempEmail from "@/lib/tempEmail";

// 请求体验证
const sendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {

    // 验证请求体
    const body = await req.json();
    const validation = sendCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email: rawEmail } = validation.data;
    const email = rawEmail.toLowerCase().trim();

    // 检查邮箱是否为临时邮箱
    if (isTempEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address, please use a real email address" },
        { status: 400 }
      );
    }

    // 检查是否可以发送（防止频繁发送）
    const canSend = await canSendCode(email);
    if (!canSend) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new code" },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateVerifyCode();

    // 存储验证码
    const storeResult = await storeVerifyCode(email, code);
    if (!storeResult.success) {
      return NextResponse.json(
        { error: "Failed to generate verification code" },
        { status: 500 }
      );
    }

    // 发送邮件
    const emailResult = await sendEmail({
      to: email,
      subject: `${code} is your verification code`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 32px 24px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                          Nano Banana
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 32px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <!-- Title -->
                          <tr>
                            <td style="padding-bottom: 24px;">
                              <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600; line-height: 28px;">
                                Verification Code
                              </h2>
                            </td>
                          </tr>
                          
                          <!-- Description -->
                          <tr>
                            <td style="padding-bottom: 32px;">
                              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                                Enter this code to complete your sign in:
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Code Box -->
                          <tr>
                            <td style="padding-bottom: 32px;">
                              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%); border: 2px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; text-align: center;">
                                <span style="font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 32px; font-weight: 700; color: #10b981; letter-spacing: 6px;">
                                  ${code}
                                </span>
                              </div>
                            </td>
                          </tr>
                          
                          <!-- Expiry Notice -->
                          <tr>
                            <td style="padding-bottom: 24px;">
                              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 18px; text-align: center;">
                                This code expires in <strong style="color: #6b7280;">5 minutes</strong>
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Security Notice -->
                          <tr>
                            <td>
                              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
                                <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 18px;">
                                  <strong>🔒 Security tip:</strong> Never share this code with anyone. Nano Banana staff will never ask for your verification code.
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td align="center">
                              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                                If you didn't request this code, you can safely ignore this email.
                              </p>
                              <p style="margin: 0; color: #d1d5db; font-size: 11px;">
                                © ${new Date().getFullYear()} Nano Banana. All rights reserved.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailResult.error) {
      console.error("Send email error:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
