import { toast } from "sonner";

export interface DownloadOptions {
  filename?: string;
  onStart?: () => void;
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export async function downloadImage(
  imageUrl: string,
  options: DownloadOptions = {}
): Promise<void> {
  if (!imageUrl) {
    throw new Error("No image URL provided");
  }

  const { filename, onStart, onSuccess, onError, onComplete } = options;

  try {
    onStart?.();

    // Generate filename
    let finalFilename = filename;
    if (!finalFilename) {
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "");
      const extension = getImageExtension(imageUrl);
      finalFilename = `nano-banana-${timestamp}.${extension}`;
    }

    console.log("🚀 Opening image in new tab for download...");

    // Open image directly in new tab
    const newWindow = window.open(imageUrl, "_blank", "noopener,noreferrer");

    if (newWindow) {
      toast.success(
        `Image opened in new tab. Right-click to save as "${finalFilename}"`
      );
      onSuccess?.(finalFilename);
    } else {
      // If popup is blocked, try using anchor tag
      console.log("🔄 Popup blocked, trying anchor tag method...");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Image link opened. Please save as "${finalFilename}"`);
      onSuccess?.(finalFilename);
    }
  } catch (error) {
    console.error("Download error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to open image";
    toast.error(`Failed to open image: ${errorMessage}`);

    if (error instanceof Error) {
      onError?.(error);
    } else {
      onError?.(new Error(errorMessage));
    }
  } finally {
    onComplete?.();
  }
}

function getImageExtension(url: string, contentType?: string | null): string {
  // Try to get extension from content type first
  if (contentType) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("webp")) return "webp";
    if (contentType.includes("gif")) return "gif";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
  }

  // Fallback to URL analysis
  if (url.includes(".png")) return "png";
  if (url.includes(".webp")) return "webp";
  if (url.includes(".gif")) return "gif";
  if (url.includes(".jpeg") || url.includes(".jpg")) return "jpg";

  // Default fallback
  return "jpg";
}

export function generateImageFilename(
  prefix: string = "nano-banana",
  type: "generated" | "edited" = "generated"
): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  return `${prefix}-${type}-${timestamp}`;
}

/**
 * Simple image viewing function - open image in new tab
 */
export function viewImage(imageUrl: string): void {
  if (!imageUrl) {
    toast.error("No image URL provided");
    return;
  }

  console.log("🖼️ Opening image in new tab:", imageUrl);

  const newWindow = window.open(imageUrl, "_blank", "noopener,noreferrer");

  if (newWindow) {
    toast.success("Image opened in new tab");
  } else {
    // If popup is blocked, try using anchor tag
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image link opened");
  }
}
