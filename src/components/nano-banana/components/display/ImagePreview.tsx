import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Download, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImagePreviewProps {
  imageUrl: string;
  onDownload?: () => void;
  onShare?: () => void;
  isShared?: boolean;
}

export default function ImagePreview({ 
  imageUrl, 
  onDownload, 
  onShare, 
  isShared = false 
}: ImagePreviewProps) {
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nano-banana-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("图片下载成功");
    } catch (error) {
      toast.error("下载失败");
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("链接已复制");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  return (
    <div className="relative h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group">
      <img
        src={imageUrl}
        alt="Generated"
        className="w-full h-full object-contain"
      />
      
      {/* 悬浮操作按钮 */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-white/90 backdrop-blur-sm shadow-lg" 
          onClick={() => window.open(imageUrl, '_blank')}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-white/90 backdrop-blur-sm shadow-lg" 
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-white/90 backdrop-blur-sm shadow-lg" 
          onClick={handleShare}
        >
          {isShared ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}