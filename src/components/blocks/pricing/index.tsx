"use client";

import { Check, Loader, Sparkles, Zap, Crown } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import { useLocale, useTranslations } from "next-intl";

export default function Pricing({ pricing }: { pricing: PricingType }) {
  if (pricing.disabled) {
    return null;
  }

  const locale = useLocale();
  const t = useTranslations();

  const { user, setShowSignModal } = useAppContext();

  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const handleCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      if (!user) {
        setShowSignModal(true);
        return;
      }

      if (item.interval !== "one-time") {
        toast.warning("支付宝和微信支付仅支持进行一次性购买和购买积分包。", {
          duration: 5000,
        });
        return;
      }

      const params = {
        product_id: item.product_id,
        currency: cn_pay ? "cny" : item.currency,
        locale: locale || "en",
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);

        setShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      const { checkout_url } = data;
      if (!checkout_url) {
        toast.error("checkout failed");
        return;
      }

      window.location.href = checkout_url;
    } catch (e) {
      console.log("checkout failed: ", e);

      toast.error("checkout failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  useEffect(() => {
    if (pricing.items) {
      setGroup(pricing.items[0].group);
      setProductId(pricing.items[0].product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

  return (
    <section id={pricing.name} className="py-15 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-cyan-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 to-green-500/10 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <div className="mx-auto mb-10 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-green-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <h2 className="mb-4 text-3xl font-bold lg:text-5xl bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            {pricing.title}
          </h2>

          <p className="text-muted-foreground lg:text-xl leading-relaxed">
            {pricing.description}
          </p>
        </div>
        <div className="text-center my-10 text-muted-foreground">
          <p className="mb-2 font-medium">
            <span className="text-green-600">•</span> Cancel anytime
            <span className="text-green-600">•</span> Unused credits roll over
            monthly
          </p>
          <p className="text-sm">
            Cancel subscription, please contact the support email:
            <a
              href="mailto:support@nanobanana.org"
              className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
            >
              support@nanobanana.org
            </a>
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          {pricing.groups && pricing.groups.length > 0 && (
            <div className="flex h-14 mb-16 items-center rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-1.5 text-lg border border-green-500/20 shadow-lg backdrop-blur-sm">
              <RadioGroup
                value={group}
                className={`h-full grid-cols-${pricing.groups.length} w-full`}
                onValueChange={(value) => {
                  setGroup(value);
                }}
              >
                {pricing.groups.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className='h-full rounded-lg transition-all duration-300 has-[button[data-state="checked"]]:bg-gradient-to-r has-[button[data-state="checked"]]:from-green-500 has-[button[data-state="checked"]]:to-cyan-500 has-[button[data-state="checked"]]:shadow-lg has-[button[data-state="checked"]]:shadow-green-500/25'
                    >
                      <RadioGroupItem
                        value={item.name || ""}
                        id={item.name}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={item.name}
                        className="flex h-full cursor-pointer items-center justify-center px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-white transition-all duration-300 hover:text-green-600"
                      >
                        {item.title}
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-green-500 bg-green-500 px-1.5 ml-2 text-white border-0 shadow-sm"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          <div
            className={`w-full mt-0 grid gap-8 md:grid-cols-${
              pricing.items?.filter(
                (item) => !item.group || item.group === group
              )?.length
            }`}
          >
            {pricing.items?.map((item, index) => {
              if (item.group && item.group !== group) {
                return null;
              }

              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                    item.is_featured
                      ? "bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-2 border-green-500/30 shadow-2xl shadow-green-500/20 ring-1 ring-green-500/20"
                      : "bg-white/50 dark:bg-slate-900/50 border border-green-500/10 shadow-lg hover:shadow-xl hover:border-green-500/20 backdrop-blur-sm"
                  }`}
                >
                  {item.is_featured && (
                    <>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0 px-4 py-1.5 shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          {t("pricing.most_popular")}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-cyan-500/5 rounded-2xl" />
                    </>
                  )}
                  <div className="flex h-full flex-col justify-between gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            item.is_featured
                              ? "bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg shadow-green-500/25"
                              : "bg-gradient-to-r from-green-500/20 to-cyan-500/20"
                          }`}
                        >
                          {item.is_featured ? (
                            <Crown
                              className={`h-6 w-6 ${
                                item.is_featured
                                  ? "text-white"
                                  : "text-green-600"
                              }`}
                            />
                          ) : (
                            <Zap className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          {item.title && (
                            <h3
                              className={`text-xl font-bold ${
                                item.is_featured
                                  ? "bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent"
                                  : "text-foreground"
                              }`}
                            >
                              {item.title}
                            </h3>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end gap-3 mb-6">
                        {item.original_price && (
                          <span className="text-xl text-muted-foreground font-semibold line-through">
                            {item.original_price}
                          </span>
                        )}
                        {item.price && (
                          <span
                            className={`text-5xl font-bold ${
                              item.is_featured
                                ? "bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent"
                                : "text-foreground"
                            }`}
                          >
                            {item.price}
                          </span>
                        )}
                        {item.unit && (
                          <span className="block font-semibold text-base text-muted-foreground mb-2">
                            {item.unit}
                          </span>
                        )}
                      </div>
                      {item.cn_amount &&
                      item.cn_amount > 0 &&
                      item.interval === "one-time" &&
                      item.title === "试用版" ? (
                        <div className="mb-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              {item.amount && (
                                <span className="text-lg text-gray-400 line-through">
                                  ¥{((item.amount / 100) * 7).toFixed(2)}
                                </span>
                              )}
                              <span className="text-2xl font-bold text-green-600">
                                ¥{(item.cn_amount / 100).toFixed(2)}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-0.5 w-fit"
                            >
                              使用微信支付宝支付享中国限时特惠
                            </Badge>
                          </div>
                        </div>
                      ) : null}
                      {item.description && (
                        <p className="text-muted-foreground text-base leading-relaxed mb-6">
                          {item.description}
                        </p>
                      )}
                      {item.features_title && (
                        <p className="mb-3 mt-6 font-semibold text-sm">
                          {item.features_title}
                        </p>
                      )}
                      {item.features && (
                        <ul className="flex flex-col gap-4">
                          {item.features.map((feature, fi) => {
                            return (
                              <li
                                className="flex gap-3 items-start"
                                key={`feature-${fi}`}
                              >
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-foreground font-medium text-sm">
                                  {feature}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.cn_amount && item.cn_amount > 0 ? (
                        <div className="flex items-center gap-x-2 mt-2">
                          <span className="text-sm">人民币支付 👉</span>
                          <div
                            className="inline-block p-2 hover:cursor-pointer hover:bg-base-200 rounded-md"
                            onClick={() => {
                              if (isLoading) {
                                return;
                              }
                              handleCheckout(item, true);
                            }}
                          >
                            <img
                              src="/imgs/cnpay.png"
                              alt="cnpay"
                              className="w-20 h-10 rounded-lg"
                            />
                          </div>
                        </div>
                      ) : null}
                      {item.button && (
                        <Button
                          className={`w-full h-12 flex items-center justify-center gap-3 font-semibold text-base transition-all duration-300 ${
                            item.is_featured
                              ? "bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
                              : "border-2 border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 hover:scale-105"
                          }`}
                          disabled={isLoading}
                          onClick={() => {
                            if (isLoading) {
                              return;
                            }
                            handleCheckout(item);
                          }}
                        >
                          {(!isLoading ||
                            (isLoading && productId !== item.product_id)) && (
                            <>
                              <span>{item.button.title}</span>
                              {item.button.icon && (
                                <Icon
                                  name={item.button.icon}
                                  className="h-5 w-5"
                                />
                              )}
                            </>
                          )}

                          {isLoading && productId === item.product_id && (
                            <>
                              <Loader className="h-5 w-5 animate-spin" />
                              <span>{item.button.title}</span>
                            </>
                          )}
                        </Button>
                      )}
                      {item.tip && (
                        <p className="text-muted-foreground text-xs mt-4 text-center bg-muted/50 p-2 rounded-lg">
                          {item.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
