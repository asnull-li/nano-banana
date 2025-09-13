import React from 'react';
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
  if (results.length <= 1) return null;

  return (
    <div className="px-6 pb-4">
      <div className="flex gap-2 overflow-x-auto">
        {results.map((result, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
              selectedResult === idx
                ? "border-green-500 shadow-lg shadow-green-500/25"
                : "border-slate-200 dark:border-slate-700 hover:border-green-400"
            )}
          >
            <img src={result.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}