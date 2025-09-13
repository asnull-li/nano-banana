import React, { useState } from 'react';
import { X, ImageOff } from 'lucide-react';

interface UploadedImage {
  id: string;
  preview: string;
  file: File;
  uploadProgress?: number;
}

interface ImageCardProps {
  image: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function ImageCard({ 
  image, 
  index, 
  onRemove, 
  disabled = false 
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 处理图片加载错误
  const handleImageError = () => {
    console.error(`图片加载失败: ${image.preview}`);
    
    // 如果是Blob URL且文件存在，尝试重新生成URL
    if (image.preview.startsWith('blob:') && image.file && retryCount < 2) {
      const newUrl = URL.createObjectURL(image.file);
      // 清理旧的URL
      URL.revokeObjectURL(image.preview);
      // 更新预览URL
      image.preview = newUrl;
      setRetryCount(retryCount + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="image-card relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-green-400">
      {/* 图片或错误占位符 */}
      {imageError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700">
          <ImageOff className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">图片加载失败</p>
        </div>
      ) : (
        <img 
          src={image.preview} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={handleImageError}
          onLoad={() => setImageError(false)}
        />
      )}
      
      {/* 顶部标签 */}
      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium image-number-pulse">
        Image #{index + 1}
      </div>
      
      
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        disabled={disabled}
        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
      >
        <X className="h-3 w-3" />
      </button>
      
      {/* 文件大小 */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium file-size-label">
        {formatFileSize(image.file.size)}
      </div>

      {/* 上传进度条 */}
      {image.uploadProgress !== undefined && image.uploadProgress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${image.uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}