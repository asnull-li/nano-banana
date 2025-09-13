import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  supportEmail?: string;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  supportEmail = "support@nano-banana.com",
}: ErrorStateProps) {
  const t = useTranslations("nano_banana.workspace.error_state");

  const displayTitle = title || t("title");
  const displayMessage = message || t("default_message");

  const handleEmailContact = () => {
    const subject = encodeURIComponent(t("email_subject"));
    const body = encodeURIComponent(
      t("email_body", { title: displayTitle, message: displayMessage })
    );
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-6">
      {/* 错误图标和标题 */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {displayTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
            {displayMessage}
          </p>
        </div>
      </div>

      {/* 错误提示框 */}
      <Alert className="max-w-md border-red-200 dark:border-red-800">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
          {t("support_message")}
        </AlertDescription>
      </Alert>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/25 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("retry_button")}
          </Button>
        )}

        <Button
          onClick={handleEmailContact}
          variant="outline"
          className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <Mail className="h-4 w-4 mr-2" />
          {t("contact_support")}
        </Button>
      </div>

      {/* 支持信息 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>{t("support_email_text")}</p>
        <p className="font-mono text-green-600 dark:text-green-400">
          {supportEmail}
        </p>
      </div>
    </div>
  );
}
