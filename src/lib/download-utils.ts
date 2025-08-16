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

  const {
    filename,
    onStart,
    onSuccess,
    onError,
    onComplete
  } = options;

  try {
    onStart?.();
    toast.loading("Preparing download...");
    
    // Fetch the image with error handling
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error("URL does not point to a valid image");
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Validate blob size
    if (blob.size === 0) {
      throw new Error("Downloaded image is empty");
    }
    
    // Create object URL
    const objectUrl = URL.createObjectURL(blob);
    
    // Generate filename if not provided
    let finalFilename = filename;
    if (!finalFilename) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const extension = getImageExtension(imageUrl, contentType);
      finalFilename = `nano-banana-${timestamp}.${extension}`;
    }
    
    // Create and click download link
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = finalFilename;
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(objectUrl);
    
    toast.dismiss();
    toast.success(`Image downloaded as ${finalFilename}`);
    onSuccess?.(finalFilename);
    
  } catch (error) {
    console.error('Download error:', error);
    toast.dismiss();
    
    const errorMessage = error instanceof Error ? error.message : "Failed to download image";
    toast.error(errorMessage);
    
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
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
  }
  
  // Fallback to URL analysis
  if (url.includes('.png')) return 'png';
  if (url.includes('.webp')) return 'webp';
  if (url.includes('.gif')) return 'gif';
  if (url.includes('.jpeg') || url.includes('.jpg')) return 'jpg';
  
  // Default fallback
  return 'jpg';
}

export function generateImageFilename(prefix: string = 'nano-banana', type: 'generated' | 'edited' = 'generated'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${prefix}-${type}-${timestamp}`;
}