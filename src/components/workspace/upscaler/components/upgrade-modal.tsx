"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRouter } from "@/i18n/navigation";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scale?: number;
  pageData?: any;
}

export default function UpgradeModal({
  open,
  onOpenChange,
  scale = 3,
  pageData,
}: UpgradeModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  // 从 pageData 获取多语言文案，提供默认值作为回退
  const texts = {
    title: pageData?.upgrade_modal?.title || "升级至会员解锁高倍放大",
    description: pageData?.upgrade_modal?.description || "${scale}x 放大是会员专属功能，升级后即可享受更强大的图片放大能力",
    vip_exclusive: pageData?.upgrade_modal?.vip_exclusive || "VIP 专属功能",
    features_title: pageData?.upgrade_modal?.features_title || "会员特权",
    feature_high_scale: pageData?.upgrade_modal?.feature_high_scale || "支持 3x、4x 高倍率图片放大",
    feature_more_credits: pageData?.upgrade_modal?.feature_more_credits || "更多积分，无限制使用",
    feature_priority: pageData?.upgrade_modal?.feature_priority || "优先处理，更快生成速度",
    upgrade_button: pageData?.upgrade_modal?.upgrade_button || "立即升级会员",
    cancel_button: pageData?.upgrade_modal?.cancel_button || "稍后再说",
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push("/pricing");
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 border-b border-amber-500/20">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-2xl transform -translate-x-12 translate-y-12" />

            <DialogHeader className="space-y-4 relative z-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Crown className="h-8 w-8 text-white" />
              </div>

              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {texts.title}
              </DialogTitle>

              <DialogDescription className="text-center text-muted-foreground">
                {texts.description.replace("${scale}", scale.toString())}
              </DialogDescription>

              <div className="flex items-center justify-center">
                <Badge className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <Crown className="h-3 w-3 mr-1" />
                  {texts.vip_exclusive}
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-slate-800 dark:text-slate-200">
                  {texts.features_title}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {texts.feature_high_scale}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {texts.feature_more_credits}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {texts.feature_priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleUpgrade}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 text-lg font-semibold"
                >
                  <Crown className="w-5 h-5 mr-3" />
                  {texts.upgrade_button}
                </Button>

                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="w-full border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30"
                >
                  {texts.cancel_button}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 px-4 pt-8 pb-6 border-b border-amber-500/20">
          {/* Background pattern for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />

          <DrawerHeader className="text-center px-0 relative z-10">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3">
              <Crown className="h-6 w-6 text-white" />
            </div>

            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {texts.title}
            </DrawerTitle>

            <DrawerDescription className="text-muted-foreground mt-2">
              {texts.description.replace("${scale}", scale.toString())}
            </DrawerDescription>

            <div className="flex items-center justify-center mt-4">
              <Badge className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white border-0 shadow-md">
                <Crown className="h-3 w-3 mr-1" />
                {texts.vip_exclusive}
              </Badge>
            </div>
          </DrawerHeader>
        </div>

        <div className="px-4 pt-6">
          <div className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-slate-800 dark:text-slate-200">
                {texts.features_title}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {texts.feature_high_scale}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {texts.feature_more_credits}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {texts.feature_priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleUpgrade}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 text-lg font-semibold"
              >
                <Crown className="w-5 h-5 mr-3" />
                {texts.upgrade_button}
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-4 pb-6">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200"
            >
              {texts.cancel_button}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}