import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Mail } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  supportEmail?: string;
}

export default function ErrorState({
  title = "生成失败",
  message = "很抱歉，图片生成过程中遇到了问题。请稍后重试，如果问题持续存在，请联系我们的技术支持团队。",
  onRetry,
  supportEmail = "support@nano-banana.com"
}: ErrorStateProps) {
  const handleEmailContact = () => {
    const subject = encodeURIComponent("Nano Banana - 技术支持请求");
    const body = encodeURIComponent(
      `您好，\n\n我在使用 Nano Banana 时遇到了问题：\n\n错误信息：${title}\n详细描述：${message}\n\n请协助解决，谢谢！\n\n用户`
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
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* 错误提示框 */}
      <Alert className="max-w-md border-red-200 dark:border-red-800">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
          如果问题持续存在，我们的技术支持团队将为您提供帮助
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
            重新尝试
          </Button>
        )}
        
        <Button
          onClick={handleEmailContact}
          variant="outline"
          className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <Mail className="h-4 w-4 mr-2" />
          联系支持
        </Button>
      </div>

      {/* 支持信息 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>技术支持邮箱：</p>
        <p className="font-mono text-green-600 dark:text-green-400">
          {supportEmail}
        </p>
      </div>
    </div>
  );
}