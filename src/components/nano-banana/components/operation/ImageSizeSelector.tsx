"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageSizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface SizeOption {
  value: string;
  label: string;
  ratio: number; // width / height
}

export default function ImageSizeSelector({
  value,
  onChange,
  disabled = false,
}: ImageSizeSelectorProps) {
  const t = useTranslations("nano_banana.workspace.image_size_selector");

  const sizeOptions: SizeOption[] = [
    { value: "auto", label: t("auto"), ratio: 1 },
    { value: "1:1", label: "1:1", ratio: 1 },
    { value: "9:16", label: "9:16", ratio: 9 / 16 },
    { value: "16:9", label: "16:9", ratio: 16 / 9 },
    { value: "3:4", label: "3:4", ratio: 3 / 4 },
    { value: "4:3", label: "4:3", ratio: 4 / 3 },
    { value: "3:2", label: "3:2", ratio: 3 / 2 },
    { value: "2:3", label: "2:3", ratio: 2 / 3 },
    { value: "5:4", label: "5:4", ratio: 5 / 4 },
    { value: "4:5", label: "4:5", ratio: 4 / 5 },
    { value: "21:9", label: "21:9", ratio: 21 / 9 },
  ];

  const getRatioDescription = (value: string) => {
    try {
      return t(`ratios.${value}`);
    } catch {
      return "";
    }
  };

  // 计算方块的尺寸，保持固定高度，宽度根据比例调整
  const getBoxDimensions = (ratio: number) => {
    const baseHeight = 20; // 固定高度
    const maxWidth = 36; // 最大宽度限制
    const minWidth = 14; // 最小宽度限制

    let width = baseHeight * ratio;

    // 限制宽度范围
    if (width > maxWidth) {
      const scale = maxWidth / width;
      width = maxWidth;
      return { width, height: baseHeight * scale };
    }

    if (width < minWidth) {
      const scale = minWidth / width;
      width = minWidth;
      return { width, height: baseHeight * scale };
    }

    return { width, height: baseHeight };
  };

  const selectedOption = sizeOptions.find((opt) => opt.value === value);
  const selectedDimensions = selectedOption
    ? getBoxDimensions(selectedOption.ratio)
    : { width: 20, height: 20 };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {t("title")}
      </Label>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2.5">
              {/* 当前选中的比例方块 */}
              <div className="w-9 flex items-center flex-shrink-0">
                <div
                  className="rounded-sm bg-emerald-400 dark:bg-emerald-500"
                  style={{
                    width: `${selectedDimensions.width}px`,
                    height: `${selectedDimensions.height}px`,
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedOption?.label || value}
                </span>
                {selectedOption && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getRatioDescription(selectedOption.value)}
                  </span>
                )}
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="max-h-[300px]">
          {sizeOptions.map((option) => {
            const { width, height } = getBoxDimensions(option.ratio);
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2.5">
                  {/* 比例可视化方块 */}
                  <div className="w-9 flex items-center flex-shrink-0">
                    <div
                      className={cn(
                        "rounded-sm transition-colors",
                        value === option.value
                          ? "bg-emerald-400 dark:bg-emerald-500"
                          : "bg-emerald-300/60 dark:bg-emerald-500/50"
                      )}
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {getRatioDescription(option.value)}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
