import { respData, respErr } from "@/lib/resp";
import { sendEmail } from "@/services/smtp";

export async function POST(req: Request) {
  try {
    const { emails, subject, content } = await req.json();

    const result = await sendEmail({
      to: emails,
      subject: subject,
      html: content,
    });

    console.log("send email result", result);

    return respData(result);
  } catch (e) {
    console.log("send email failed:", e);
    return respErr("send email failed");
  }
}
