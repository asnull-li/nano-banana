"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function OrderTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const order_no = searchParams.get("order_no");
    const value = searchParams.get("value");
    const currency = searchParams.get("currency");

    if (order_no && value && currency) {
      // 确保 dataLayer 存在
      if (typeof window !== "undefined" && window.dataLayer) {
        // 上报 GTM 购买转化事件
        window.dataLayer.push({
          event: "purchase_success",
          order_id: order_no,
          value: parseInt(value) / 100,
          currency: currency.toUpperCase(),
        });

        // console.log("GTM purchase event sent:", {
        //   event: "purchase_success",
        //   order_id: order_no,
        //   value: parseInt(value) / 100,
        //   currency: currency.toUpperCase(),
        // });
      }

      // 清除 URL 参数
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  return null; // 这个组件不渲染任何内容
}
