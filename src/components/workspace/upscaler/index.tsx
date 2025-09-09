"use client";

import UpscalerWorkspace from "./upscaler-workspace";
import { UpscalerWorkspaceProps } from "./upscaler-workspace";

// Re-export the main component
export default UpscalerWorkspace;

// Export types for external usage
export type { UpscalerWorkspaceProps };

// Export sub-components for advanced usage
export { default as ImageUploadZone } from "./components/image-upload-zone";
export { default as UpscalerControls } from "./components/upscaler-controls";
export { default as OutputDisplay } from "./components/output-display";
export { default as StatusIndicator } from "./components/status-indicator";

// Export hooks
export { useUpscalerAPI } from "./hooks/use-upscaler-api";

// Export types from hooks
export type {
  UpscaleRequest,
  UpscaleResponse,
  TaskStatusResponse,
} from "./hooks/use-upscaler-api";