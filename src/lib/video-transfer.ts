/**
 * Video Transfer Service
 * Transfers videos from external URLs to R2 storage
 */

import { r2Upload } from "./r2-upload";

/**
 * Download video from URL and upload to R2
 * @param videoUrl - Source video URL
 * @param userUuid - User UUID for organizing files
 * @param taskId - Task ID for unique naming
 * @param quality - Video quality identifier (720p or 1080p)
 * @returns R2 video URL
 */
export async function transferVideoToR2(
  videoUrl: string,
  userUuid: string,
  taskId: string,
  quality: "720p" | "1080p" = "720p"
): Promise<string> {
  try {
    console.log(`Starting video transfer from ${videoUrl}`);

    // Download video
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Get content type and buffer
    const contentType = response.headers.get("content-type") || "video/mp4";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(
      `Video downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
    );

    // Extract file extension from content type or URL
    let extension = "mp4";
    if (contentType.includes("webm")) {
      extension = "webm";
    } else if (contentType.includes("avi")) {
      extension = "avi";
    } else if (contentType.includes("mov")) {
      extension = "mov";
    }

    // Create path: video/{userUuid}/{taskId}_{quality}.{ext}
    const r2Path = `video/${userUuid}/${taskId}_${quality}.${extension}`;

    // Upload to R2
    const r2Url = await r2Upload.uploadFileWithCustomPath(
      buffer,
      r2Path,
      contentType
    );

    console.log(`Video transferred successfully: ${videoUrl} -> ${r2Url}`);
    return r2Url;
  } catch (error) {
    console.error(`Failed to transfer video from ${videoUrl}:`, error);
    // Return original URL if transfer fails
    return videoUrl;
  }
}

/**
 * Transfer multiple videos to R2
 * @param videoUrls - Array of source video URLs
 * @param userUuid - User UUID for organizing files
 * @param taskId - Task ID for unique naming
 * @param quality - Video quality identifier
 * @returns Array of R2 video URLs
 */
export async function transferVideosToR2(
  videoUrls: string[],
  userUuid: string,
  taskId: string,
  quality: "720p" | "1080p" = "720p"
): Promise<string[]> {
  const results = await Promise.all(
    videoUrls.map((url, index) =>
      transferVideoToR2(
        url,
        userUuid,
        index > 0 ? `${taskId}_${index}` : taskId,
        quality
      )
    )
  );
  return results;
}
