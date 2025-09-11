import { Button } from "@/types/blocks/base/button";

export interface PricingGroup {
  name?: string;
  title?: string;
  description?: string;
  label?: string;
}

export interface PricingItem {
  title?: string;
  description?: string;
  label?: string;
  price?: string;
  original_price?: string;
  discount_price?: string;
  discount_amount?: number;
  currency?: string;
  unit?: string;
  features_title?: string;
  features?: string[];
  button?: Button;
  tip?: string;
  is_featured?: boolean;
  interval: "month" | "year" | "one-time";
  product_id: string;
  product_name?: string;
  amount: number;
  cn_amount?: number;
  currency: string;
  original_cn_price?: string;
  credits?: number;
  valid_months?: number;
  group?: string;
}

export interface Pricing {
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  items?: PricingItem[];
  groups?: PricingGroup[];
  save_yearly?: string;
  cancel_anytime?: string;
  cancel_subscription_text?: string;
  mo?: string;
  year?: string;
}
