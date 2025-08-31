import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

let transporter: Transporter | null = null;

/**
 * Get or create SMTP transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.zoho.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });
  }
  return transporter;
}

/**
 * Send email via SMTP
 * Interface compatible with Resend for easy migration
 */
export async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
}) {
  // Check if SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("SMTP configuration missing");
    return {
      data: null,
      error: new Error("Email service not configured"),
    };
  }

  const fromAddress =
    from ||
    `${process.env.SMTP_FROM_NAME || "Nano Banana"} <${
      process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    }>`;

  try {
    const transporter = getTransporter();
    const mailOptions: Mail.Options = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    return {
      data: { id: info.messageId },
      error: null,
    };
  } catch (error) {
    console.error("SMTP send error:", error);
    return {
      data: null,
      error: error as Error,
    };
  }
}
