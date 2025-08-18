"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadImage } from "@/lib/download-utils";
import { toast } from "sonner";

export default function TestDownloadPage() {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const [successFilename, setSuccessFilename] = useState("");

  const handleDownload = async () => {
    const imageUrl =
      "https://file.nanobanana.org/transfer/nano-banana-1755537475823-zqrrnf.png";

    await downloadImage(imageUrl, {
      filename: "nano-banana-test-image.png",
      onStart: () => {
        setDownloading(true);
        setStatus("开始下载...");
        setSuccessFilename("");
      },
      onSuccess: (filename) => {
        setStatus("下载成功！");
        setSuccessFilename(filename);
        console.log("✅ Downloaded:", filename);
      },
      onError: (error) => {
        setStatus(`下载失败: ${error.message}`);
        console.error("❌ Download failed:", error);
      },
      onComplete: () => {
        setDownloading(false);
      },
    });
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>图片下载测试页面</CardTitle>
          <CardDescription>
            测试 @/lib/download-utils.ts 中的下载函数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-mono break-all">
              图片 URL:
              https://file.nanobanana.org/transfer/nano-banana-1755441469760-1v8sdd.png
            </p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full"
          >
            {downloading ? "下载中..." : "下载图片"}
          </Button>

          {status && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status.includes("成功")
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : status.includes("失败")
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              }`}
            >
              {status}
              {successFilename && (
                <div className="mt-1 text-xs opacity-80">
                  文件名: {successFilename}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">测试说明</h3>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• 使用 @/lib/download-utils.ts 中的 downloadImage 函数</li>
              <li>• 支持回调函数: onStart, onSuccess, onError, onComplete</li>
              <li>• 自动生成文件名或使用指定文件名</li>
              <li>• 使用 fetch + blob 方式直接下载</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
