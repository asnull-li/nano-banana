"use client";

import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Veo3Task } from "../../types";

interface FailedStateProps {
  task: Veo3Task;
  onRetry?: () => void;
  supportEmail?: string;
  texts?: any;
}

export default function FailedState({
  task,
  onRetry,
  supportEmail = "support@nanobanana.org",
  texts = {},
}: FailedStateProps) {
  const handleEmailContact = () => {
    const subject = encodeURIComponent("Veo3 Video Generation Failed");
    const body = encodeURIComponent(
      `Hi Support Team,\n\nI encountered an error while generating a video:\n\nPrompt: ${task.prompt}\nModel: ${task.model}\nError: ${task.error || "Unknown error"}\n\nPlease help me resolve this issue.\n\nThank you!`
    );
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {texts.title || "Generation Failed"}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            {task.error || texts.error_default || "An unexpected error occurred during video generation"}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{texts.prompt_label || "Your Prompt:"}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {task.prompt}
          </p>
        </div>

        <Alert className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm text-slate-700 dark:text-slate-300">
            {texts.credits_refunded || "Your credits have been refunded. If the issue persists, please contact our support team."}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {texts.try_again || "Try Again"}
            </Button>
          )}

          <Button
            onClick={handleEmailContact}
            variant="outline"
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-2" />
            {texts.contact_support || "Contact Support"}
          </Button>
        </div>

        {/* Support Email Info */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-1 pt-2">
          <p>{texts.need_help || "Need help? Email us at:"}</p>
          <p className="font-mono text-emerald-600 dark:text-emerald-400">
            {supportEmail}
          </p>
        </div>
      </div>
    </div>
  );
}
