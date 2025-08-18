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

export default function TestDownload3Page() {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");

  async function downloadImage(url: string, filename: string) {
    const response = await fetch(url, {
      referrerPolicy: "no-referrer",
    });
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
      // 使用一个示例图片URL，你可以根据需要修改
      const imageUrl =
        "https://file.nanobanana.org/transfer/nano-banana-1755530640914-5xzufa.png";
      const filename = "test-download3-image.png";

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
          <CardTitle>下载测试3</CardTitle>
          <CardDescription>
            使用 downloadImage 函数测试图片下载功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              测试图片 URL:
            </p>
            <p className="text-sm font-mono break-all">
              https://file.nanobanana.org/transfer/nano-banana-test-download3.png
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
              size="lg"
            >
              {downloading ? "正在下载..." : "点击下载图片"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              点击按钮将下载测试图片到本地
            </div>
          </div>

          {status && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
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

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">下载函数说明：</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 使用 fetch 获取图片资源</li>
              <li>• 转换为 Blob 对象</li>
              <li>• 创建临时 URL</li>
              <li>• 模拟点击下载</li>
              <li>• 自动释放内存</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
