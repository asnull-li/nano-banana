/**
 * Flux Images Generation API Service
 * Based on https://platform.acedata.cloud/documents/92754994-3970-4f2a-9bf3-113149c25c11
 */

export interface FluxGenerateRequest {
  action: "generate" | "edits";
  prompt: string;
  model?: "flux-kontext-pro" | "flux-kontext-max";
  size?: string;
  count?: number;
  image_url?: string; // Required for edits
  callback_url?: string;
}

export interface FluxImageResult {
  prompt: string;
  image_url: string;
  timings?: number;
  seed?: number;
}

export interface FluxResponse {
  success: boolean;
  task_id?: string;
  trace_id?: string;
  data?: FluxImageResult[];
  error?: {
    code: string;
    message: string;
  };
}

export class FluxAPIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl =
      process.env.FLUX_API_URL || "https://api.acedata.cloud/flux/images";
    this.apiKey = process.env.FLUX_API_KEY || "";

    if (!this.apiKey) {
      console.warn("FLUX_API_KEY is not set in environment variables");
    }
  }

  /**
   * Generate images from text prompt
   */
  async generateImage(
    prompt: string,
    options: {
      model?: "flux-kontext-pro" | "flux-kontext-max";
      size?: string;
      count?: number;
      callback_url?: string;
    } = {}
  ): Promise<FluxResponse> {
    const payload: FluxGenerateRequest = {
      action: "generate",
      prompt,
      model: options.model || "flux-kontext-pro",
      count: options.count || 1,
      ...options,
    };

    return this.makeRequest(payload);
  }

  /**
   * Edit existing image with prompt
   */
  async editImage(
    imageUrl: string,
    prompt: string,
    options: {
      model?: "flux-kontext-pro" | "flux-kontext-max";
      callback_url?: string;
    } = {}
  ): Promise<FluxResponse> {
    const payload: FluxGenerateRequest = {
      action: "edits",
      prompt,
      image_url: imageUrl,
      model: options.model || "flux-kontext-pro",
      ...options,
    };

    return this.makeRequest(payload);
  }

  /**
   * Make API request
   */
  private async makeRequest(
    payload: FluxGenerateRequest
  ): Promise<FluxResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // console.log("response", response);
      // console.log("payload", payload);

      const data = await response.json();
      // console.log("data", data);

      if (!response.ok) {
        // Handle error responses
        return {
          success: false,
          error: {
            code: data.error?.code || `http_${response.status}`,
            message: data.error?.message || `HTTP ${response.status} error`,
          },
        };
      }

      // If the API returns just a task_id, it's async
      if (data.task_id && !data.data) {
        return {
          success: true,
          task_id: data.task_id,
          trace_id: data.trace_id,
        };
      }

      // Otherwise return the full data
      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error("Flux API request failed:", error);
      return {
        success: false,
        error: {
          code: "network_error",
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  /**
   * Poll for task result (for async operations)
   */
  async pollTaskResult(
    taskId: string,
    maxAttempts = 60,
    interval = 2000
  ): Promise<FluxResponse> {
    // This would need a separate endpoint to check task status
    // For now, we'll use callback_url approach
    console.log(`Polling for task ${taskId} is not yet implemented`);
    return {
      success: false,
      error: {
        code: "not_implemented",
        message: "Task polling not implemented. Use callback_url instead.",
      },
    };
  }
}

// Singleton instance
export const fluxAPI = new FluxAPIService();
