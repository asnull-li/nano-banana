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

export default function TestDownloadPage() {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");

  async function downloadImage(url: string, filename: string) {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl); // 释放内存
  }

  const handleDownload = async () => {
    setDownloading(true);
    setStatus("开始下载...");

    try {
      const imageUrl =
        "https://file.nanobanana.org/transfer/nano-banana-1755530640914-5xzufa.png";
      const filename = "nano-banana-test-image.png";

      await downloadImage(imageUrl, filename);
      setStatus("下载成功！");
    } catch (error) {
      console.error("下载失败:", error);
      setStatus(
        `下载失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>图片下载测试页面</CardTitle>
          <CardDescription>测试下载功能，点击按钮下载测试图片</CardDescription>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
