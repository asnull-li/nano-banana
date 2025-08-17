"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/app";
import { UserCredits } from "@/types/user";

export interface CreditsConfig {
  pro: number;
  max: number;
}

export const CREDITS_COST: CreditsConfig = {
  pro: 2,
  max: 4,
};

export function useCredits() {
  const router = useRouter();
  const { user, setUser, fetchUserInfo, setShowSignModal } = useAppContext();
  const [credits, setCredits] = useState<UserCredits>({ left_credits: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user credits from API (fallback method)
  const fetchCredits = useCallback(async () => {
    // 如果没有用户信息，则调用 API 获取
    try {
      const response = await fetch("/api/get-user-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // respData 返回的格式是 {code: 0, message: "ok", data: {...}}
        if (data.code === 0 && data.data) {
          setCredits(data.data);
          
          // 更新 AppContext 中的用户积分信息
          if (user) {
            setUser({ ...user, credits: data.data });
          }
        } else {
          setCredits({ left_credits: 0 });
        }
      } else {
        console.error("Failed to fetch credits:", response.status);
        setCredits({ left_credits: 0 });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits({ left_credits: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  // Check if user has enough credits for a specific quality
  const hasEnoughCredits = useCallback(
    (quality: keyof CreditsConfig): boolean => {
      const requiredCredits = CREDITS_COST[quality];
      return credits.left_credits >= requiredCredits;
    },
    [credits.left_credits]
  );

  // Validate credits before operation with user feedback
  const validateCredits = useCallback(
    (quality: keyof CreditsConfig): boolean => {
      // Check if user is logged in first
      if (!user) {
        toast.error("Please sign in to generate images", {
          duration: 2000,
        });
        // Open sign in modal
        if (setShowSignModal && typeof setShowSignModal === 'function') {
          setShowSignModal(true);
        }
        return false;
      }
      
      const requiredCredits = CREDITS_COST[quality];
      const qualityName = quality === "pro" ? "Pro" : "Max";

      // Check if user has enough credits
      if (!hasEnoughCredits(quality)) {
        // Show error toast briefly, then redirect
        toast.error(
          `Insufficient credits. ${qualityName} mode requires ${requiredCredits} credits, but you only have ${credits.left_credits} credits left.`,
          {
            duration: 2000,
          }
        );
        
        // Automatically redirect to pricing page after a short delay
        setTimeout(() => {
          router.push("/pricing");
        }, 1500);
        
        return false;
      }

      return true;
    },
    [hasEnoughCredits, credits.left_credits, router, user, setShowSignModal]
  );

  // Optimistically update credits after successful operation
  const consumeCredits = useCallback(
    (quality: keyof CreditsConfig) => {
      const requiredCredits = CREDITS_COST[quality];
      const newCredits = {
        ...credits,
        left_credits: Math.max(0, credits.left_credits - requiredCredits),
      };
      setCredits(newCredits);
      
      // 同时更新 AppContext 中的用户积分
      if (user) {
        setUser({ ...user, credits: newCredits });
      }
    },
    [credits, user, setUser]
  );

  // Refresh credits (e.g., after purchase or generation)
  const refreshCredits = useCallback(async () => {
    // 使用原有系统的 fetchUserInfo 来刷新用户信息（包括积分）
    if (fetchUserInfo && typeof fetchUserInfo === 'function') {
      await fetchUserInfo();
    } else {
      // 如果 fetchUserInfo 不可用，降级到直接调用 API
      await fetchCredits();
    }
  }, [fetchUserInfo, fetchCredits]);

  // Initialize credits on mount and when user changes
  useEffect(() => {
    if (user?.credits) {
      setCredits(user.credits);
      setIsLoading(false);
    } else {
      fetchCredits();
    }
  }, [user, fetchCredits]);

  return {
    credits,
    isLoading,
    isAuthenticated: !!user, // 基于用户状态判断是否已认证
    hasEnoughCredits,
    validateCredits,
    consumeCredits,
    refreshCredits,
    CREDITS_COST,
  };
}