import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Maximize2, Check, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActionButtonsProps {
  imageUrl: string;
  isShared?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function ActionButtons({
  imageUrl,
  isShared = false,
  onDownload,
  onShare,
}: ActionButtonsProps) {
  const t = useTranslations("nano_banana.workspace.action_buttons");
  const router = useRouter();

  const handleImageToVideo = () => {
    if (!imageUrl) {
      toast.error("No image selected");
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(imageUrl);

      // 将当前图片URL作为查询参数，跳转到veo3页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", imageUrl);

      router.push(`/veo3?${searchParams.toString()}`);
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error("Invalid image URL");
    }
  };

  return (
    <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="hover:border-green-500 hover:text-green-500"
        >
          <Download className="h-4 w-4 mr-2" />
          {t("download")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="hover:border-blue-500 hover:text-blue-500"
        >
          {isShared ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              {t("copied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              {t("copy_link")}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleImageToVideo}
          className="hover:border-purple-500 hover:text-purple-500"
        >
          <Video className="h-4 w-4 mr-2" />
          {t("image_to_video")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(imageUrl, "_blank")}
          className="hover:border-orange-500 hover:text-orange-500"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          {t("view_large")}
        </Button>
      </div>
    </div>
  );
}
