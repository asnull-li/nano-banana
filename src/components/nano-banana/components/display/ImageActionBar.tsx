import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface ImageActionBarProps {
  imageUrl: string;
  onDownload: () => void;
  onEnhance?: () => void;
  onContinueEdit?: () => Promise<void> | void;
  disabled?: boolean;
}

export default function ImageActionBar({
  imageUrl,
  onDownload,
  onEnhance,
  onContinueEdit,
  disabled = false,
}: ImageActionBarProps) {
  const router = useRouter();
  const t = useTranslations("nano_banana.workspace.image_action_bar");

  const handleEnhance = () => {
    if (!imageUrl) {
      toast.error(t("image_not_found"));
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(imageUrl);

      // 将当前图片URL作为查询参数，跳转到AI图像放大器页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", imageUrl);

      router.push(`/ai-image-upscaler?${searchParams.toString()}`);
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error(t("invalid_image_url"));
    }
  };

  const handleContinueEdit = async () => {
    if (onContinueEdit) {
      await onContinueEdit();
    } else {
      toast.info(t("continue_edit_coming_soon"));
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-center gap-3">
        {/* 下载按钮 */}
        <Button
          onClick={onDownload}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {t("download")}
        </Button>

        {/* 图片增强按钮 */}
        <Button
          onClick={onEnhance || handleEnhance}
          disabled={disabled}
          variant="outline"
          className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 transition-all duration-200"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t("enhance")}
        </Button>

        {/* 继续编辑按钮 */}
        <Button
          onClick={handleContinueEdit}
          disabled={disabled}
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-200"
          size="sm"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {t("continue_edit")}
        </Button>
      </div>
    </div>
  );
}
