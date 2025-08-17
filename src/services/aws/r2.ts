/**
 * R2 Service Wrapper
 * Provides simplified methods for R2 operations
 */

import { r2Upload } from "@/lib/r2-upload";

/**
 * Upload file to R2
 */
export async function uploadFileToR2({
  file,
  fileName,
  contentType,
}: {
  file: Buffer | Uint8Array;
  fileName: string;
  contentType: string;
}): Promise<string> {
  try {
    const url = await r2Upload.uploadFile(file, fileName, contentType);
    return url;
  } catch (error) {
    console.error("Failed to upload file to R2:", error);
    throw error;
  }
}

/**
 * Get R2 file URL
 */
export function getR2FileUrl(key: string): string {
  // If key already includes the full path, just return with public URL
  if (key.startsWith("uploads/") || key.startsWith("downloads/")) {
    return r2Upload.getPublicUrl(key);
  }
  // Otherwise, prepend the default path
  return r2Upload.getPublicUrl(`uploads/${key}`);
}

/**
 * Upload base64 image to R2
 */
export async function uploadBase64ToR2(
  base64Data: string,
  filename?: string
): Promise<string> {
  try {
    const url = await r2Upload.uploadBase64Image(base64Data, filename);
    return url;
  } catch (error) {
    console.error("Failed to upload base64 to R2:", error);
    throw error;
  }
}

/**
 * Transfer external image URL to R2
 */
export async function transferExternalImageToR2(
  imageUrl: string
): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Get image data
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    let extension = "jpg";

    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("gif")) extension = "gif";

    const fullPath = `transfer/nano-banana-${timestamp}-${randomStr}.${extension}`;

    // Upload to R2 with custom path
    const url = await r2Upload.uploadFileWithCustomPath(buffer, fullPath, contentType);

    return url;
  } catch (error) {
    console.error("Failed to transfer image to R2:", error);
    throw error;
  }
}
