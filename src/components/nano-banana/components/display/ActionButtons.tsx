import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, Maximize2, Check } from 'lucide-react';

interface ActionButtonsProps {
  imageUrl: string;
  isShared?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function ActionButtons({ 
  imageUrl, 
  isShared = false, 
  onDownload, 
  onShare 
}: ActionButtonsProps) {
  return (
    <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDownload} 
          className="hover:border-green-500 hover:text-green-500"
        >
          <Download className="h-4 w-4 mr-2" />
          下载
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShare} 
          className="hover:border-blue-500 hover:text-blue-500"
        >
          {isShared ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(imageUrl, '_blank')} 
          className="hover:border-purple-500 hover:text-purple-500"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          查看大图
        </Button>
      </div>
    </div>
  );
}