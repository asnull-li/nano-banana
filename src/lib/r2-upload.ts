/**
 * Cloudflare R2 Upload Service
 * Handles image uploads to R2 storage
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class R2UploadService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || "nano-banana";
    this.publicUrl = process.env.R2_PUBLIC_URL || "";

    // Construct R2 endpoint URL
    const accountId = process.env.R2_ACCOUNT_ID;
    const endpoint = accountId 
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : "";

    this.client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  /**
   * Upload file to R2
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    contentType: string = "image/png"
  ): Promise<string> {
    const key = `uploads/${Date.now()}-${filename}`;

    try {
      console.log("Uploading to R2:", {
        bucket: this.bucketName,
        key,
        contentType,
        publicUrl: this.publicUrl,
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.client.send(command);

      // Return public URL
      const url = `${this.publicUrl}/${key}`;
      console.log("Upload successful, URL:", url);
      return url;
    } catch (error: any) {
      console.error("R2 upload failed with error:", {
        message: error.message,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
        bucket: this.bucketName,
        accountId: process.env.R2_ACCOUNT_ID,
      });
      throw new Error(`Failed to upload file to R2: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Upload file to R2 with custom path
   */
  async uploadFileWithCustomPath(
    file: Buffer | Uint8Array,
    fullPath: string,
    contentType: string = "image/png"
  ): Promise<string> {
    try {
      console.log("Uploading to R2 with custom path:", {
        bucket: this.bucketName,
        key: fullPath,
        contentType,
        publicUrl: this.publicUrl,
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fullPath,
        Body: file,
        ContentType: contentType,
      });

      await this.client.send(command);

      // Return public URL
      const url = `${this.publicUrl}/${fullPath}`;
      console.log("Upload successful, URL:", url);
      return url;
    } catch (error: any) {
      console.error("R2 upload failed with error:", {
        message: error.message,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
        bucket: this.bucketName,
        accountId: process.env.R2_ACCOUNT_ID,
      });
      throw new Error(`Failed to upload file to R2: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate presigned upload URL for client-side upload
   */
  async getPresignedUploadUrl(
    filename: string,
    contentType: string = "image/png",
    expiresIn: number = 3600
  ): Promise<{ url: string; key: string }> {
    const key = `uploads/${Date.now()}-${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return {
        url,
        key,
      };
    } catch (error) {
      console.error("Failed to generate presigned URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  /**
   * Upload base64 image
   */
  async uploadBase64Image(base64Data: string, filename?: string): Promise<string> {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    
    // Detect image type from base64 header
    let contentType = "image/png";
    if (base64Data.startsWith("data:image/jpeg")) {
      contentType = "image/jpeg";
    } else if (base64Data.startsWith("data:image/webp")) {
      contentType = "image/webp";
    }

    const extension = contentType.split("/")[1];
    const finalFilename = filename || `image-${Date.now()}.${extension}`;

    return this.uploadFile(buffer, finalFilename, contentType);
  }

  /**
   * Get public URL for a key
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

// Singleton instance
export const r2Upload = new R2UploadService();