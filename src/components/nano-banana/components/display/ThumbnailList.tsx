import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Result {
  url: string;
}

interface ThumbnailListProps {
  results: Result[];
  selectedResult: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailList({ results, selectedResult, onSelect }: ThumbnailListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedThumbnailRef = useRef<HTMLButtonElement>(null);

  if (results.length <= 1) return null;

  // 处理左右导航
  const handlePrevious = () => {
    const newIndex = selectedResult > 0 ? selectedResult - 1 : results.length - 1;
    onSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedResult < results.length - 1 ? selectedResult + 1 : 0;
    onSelect(newIndex);
  };

  // 键盘导航支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedResult, results.length]);

  // 自动滚动到选中的缩略图
  useEffect(() => {
    if (selectedThumbnailRef.current && scrollContainerRef.current) {
      const thumbnail = selectedThumbnailRef.current;
      const container = scrollContainerRef.current;
      
      const thumbnailRect = thumbnail.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const isVisible = 
        thumbnailRect.left >= containerRect.left && 
        thumbnailRect.right <= containerRect.right;
      
      if (!isVisible) {
        thumbnail.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      }
    }
  }, [selectedResult]);

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center gap-2">
        {/* 左侧导航按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          <ChevronLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
        </Button>

        {/* 缩略图容器 */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {results.map((result, idx) => (
            <button
              key={idx}
              ref={selectedResult === idx ? selectedThumbnailRef : null}
              onClick={() => onSelect(idx)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                selectedResult === idx
                  ? "border-green-500 shadow-lg shadow-green-500/25 scale-105"
                  : "border-slate-200 dark:border-slate-700 hover:border-green-400 hover:scale-102"
              )}
            >
              <img 
                src={result.url} 
                alt={`Result ${idx + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* 右侧导航按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
        </Button>
      </div>

      {/* 指示器 */}
      <div className="flex justify-center mt-3 gap-1">
        {results.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              selectedResult === idx
                ? "bg-green-500"
                : "bg-slate-300 dark:bg-slate-600"
            )}
          />
        ))}
      </div>
    </div>
  );
}