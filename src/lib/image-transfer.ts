/**
 * Image Transfer Service
 * Transfers images from external URLs to R2 storage
 */

import { r2Upload } from "./r2-upload";

/**
 * Download image from URL and upload to R2
 * @param imageUrl - Source image URL
 * @param provider - Provider name (kie or fal)
 * @returns R2 image URL
 */
export async function transferImageToR2(
  imageUrl: string,
  provider: string = "kie"
): Promise<string> {
  try {
    console.log(`Starting image transfer from ${imageUrl}`);
    
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Get content type and buffer
    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate R2 path
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    
    // Extract file extension from content type or URL
    let extension = "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      extension = "jpg";
    } else if (contentType.includes("webp")) {
      extension = "webp";
    } else if (contentType.includes("gif")) {
      extension = "gif";
    }
    
    // Create path: nano-banana/{provider}/{date}/{timestamp}-{random}.{ext}
    const r2Path = `nano-banana/${provider}/${dateStr}/${timestamp}-${randomStr}.${extension}`;
    
    // Upload to R2
    const r2Url = await r2Upload.uploadFileWithCustomPath(
      buffer,
      r2Path,
      contentType
    );
    
    console.log(`Image transferred successfully: ${imageUrl} -> ${r2Url}`);
    return r2Url;
  } catch (error) {
    console.error(`Failed to transfer image from ${imageUrl}:`, error);
    // Return original URL if transfer fails
    return imageUrl;
  }
}

/**
 * Transfer multiple images to R2
 * @param imageUrls - Array of source image URLs
 * @param provider - Provider name (kie or fal)
 * @returns Array of R2 image URLs
 */
export async function transferImagesToR2(
  imageUrls: string[],
  provider: string = "kie"
): Promise<string[]> {
  const results = await Promise.all(
    imageUrls.map(url => transferImageToR2(url, provider))
  );
  return results;
}