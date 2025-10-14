import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Sparkles, Edit3, Video, Film, Clapperboard } from "lucide-react";
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

  const handleImageToVideo = (model: "veo3" | "sora2") => {
    if (!imageUrl) {
      toast.error(t("image_not_found"));
      return;
    }

    try {
      // 验证图片URL是否有效
      new URL(imageUrl);

      // 将当前图片URL作为查询参数，跳转到对应页面
      const searchParams = new URLSearchParams();
      searchParams.set("imageUrl", imageUrl);

      const targetPath = model === "veo3" ? "/veo3" : "/sora2";
      router.push(`${targetPath}?${searchParams.toString()}`);
    } catch (error) {
      console.error("Invalid image URL:", error);
      toast.error(t("invalid_image_url"));
    }
  };

  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* 下载按钮 */}
        <Button
          onClick={onDownload}
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">{t("download")}</span>
        </Button>

        {/* 图片增强按钮 */}
        <Button
          onClick={onEnhance || handleEnhance}
          disabled={disabled}
          variant="outline"
          className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">{t("enhance")}</span>
        </Button>

        {/* 图生视频下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={disabled}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/20 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
              size="sm"
            >
              <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{t("image_to_video")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleImageToVideo("veo3")}>
              <Film className="h-4 w-4 mr-2" />
              {t("use_veo3")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleImageToVideo("sora2")}>
              <Clapperboard className="h-4 w-4 mr-2" />
              {t("use_sora2")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 继续编辑按钮 */}
        <Button
          onClick={handleContinueEdit}
          disabled={disabled}
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
          size="sm"
        >
          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">{t("continue_edit")}</span>
        </Button>
      </div>
    </div>
  );
}
