"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Coins, Zap } from "lucide-react";
import { CREDITS_PER_1080P } from "@/lib/constants/veo3";

interface Upgrade1080pModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isUpgrading: boolean;
  currentCredits: number;
  texts?: any;
}

export default function Upgrade1080pModal({
  open,
  onOpenChange,
  onConfirm,
  isUpgrading,
  currentCredits,
  texts = {},
}: Upgrade1080pModalProps) {
  const hasEnoughCredits = currentCredits >= CREDITS_PER_1080P;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            {texts.title || "Upgrade to 1080P"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {texts.description || "Upgrade your video to crystal-clear 1080P resolution for better viewing experience."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Content moved outside AlertDialogDescription to fix hydration error */}
        <div className="space-y-4 px-6">
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  {texts.enhanced_quality_title || "Enhanced Quality"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {texts.enhanced_quality_description || "Upgrade your video to crystal-clear 1080P resolution for better viewing experience and professional presentation."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {texts.cost_label || "Cost"}
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {CREDITS_PER_1080P} credits
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {texts.balance_label || "Your balance"}
            </span>
            <span
              className={`font-semibold ${
                hasEnoughCredits
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {currentCredits} credits
            </span>
          </div>

          {!hasEnoughCredits && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {texts.insufficient_credits || "You don't have enough credits. Please recharge first."}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {texts.hint || "The upgraded 1080P video will be generated and saved alongside your 720P version. You can switch between them anytime."}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpgrading}>{texts.cancel || "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpgrading || !hasEnoughCredits}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
          >
            {isUpgrading ? (texts.confirming || "Upgrading...") : (texts.confirm?.replace("${credits}", CREDITS_PER_1080P) || `Confirm (${CREDITS_PER_1080P} credits)`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
