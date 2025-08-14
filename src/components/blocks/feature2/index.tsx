"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import Fade from "embla-carousel-fade";
import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

const DURATION = 5000;

export default function Feature2({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [api, setApi] = useState<CarouselApi>();
  const [currentAccordion, setCurrentAccordion] = useState("1");

  useEffect(() => {
    api?.scrollTo(+currentAccordion - 1);
    const interval = setInterval(() => {
      setCurrentAccordion((prev) => {
        const next = parseInt(prev) + 1;
        return next > (section.items?.length || 3) ? "1" : next.toString();
      });
    }, DURATION);

    return () => clearInterval(interval);
  }, [api, currentAccordion, section.items?.length]);

  return (
    <section id={section.name} className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container">
        <div className="mx-auto grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
          {/* 内容区域 */}
          <div className="space-y-8">
            {/* 标签和标题 */}
            <div className="space-y-4">
              {section.label && (
                <Badge className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 text-green-700 [.dark_&]:text-green-300 border-green-500/30 [.dark_&]:border-green-400/40 px-4 py-1">
                  {section.label}
                </Badge>
              )}
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 [.dark_&]:from-white [.dark_&]:via-slate-100 [.dark_&]:to-white bg-clip-text text-transparent leading-tight">
                {section.title}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                {section.description}
              </p>
            </div>

            {/* 手风琴列表 */}
            <Accordion
              type="single"
              value={currentAccordion}
              onValueChange={(value) => {
                setCurrentAccordion(value);
                api?.scrollTo(+value - 1);
              }}
              className="space-y-4"
            >
              {section.items?.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={(i + 1).toString()}
                  className="group rounded-xl bg-gradient-to-r from-white/60 to-slate-50/40 [.dark_&]:from-slate-800/40 [.dark_&]:to-slate-900/30 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/50 data-[state=open]:border-green-500/40 [.dark_&]:data-[state=open]:border-green-400/60 transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group-hover:text-green-600 [.dark_&]:group-hover:text-green-400 data-[state=open]:text-green-600 [.dark_&]:data-[state=open]:text-green-400 transition-colors">
                    <div className="flex items-center gap-4">
                      {item.icon && (
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-data-[state=open]:opacity-50 [.dark_&]:group-data-[state=open]:opacity-60 transition-opacity" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-green-500/10 to-cyan-500/10 [.dark_&]:from-green-400/20 [.dark_&]:to-cyan-400/20 group-data-[state=open]:from-green-500 group-data-[state=open]:to-cyan-500 [.dark_&]:group-data-[state=open]:from-green-400 [.dark_&]:group-data-[state=open]:to-cyan-400 rounded-lg flex items-center justify-center transition-all duration-300">
                            <Icon
                              name={item.icon}
                              className="w-5 h-5 text-green-600 [.dark_&]:text-green-400 group-data-[state=open]:text-white transition-colors"
                            />
                          </div>
                        </div>
                      )}
                      <span className="font-semibold text-base lg:text-lg text-slate-800 [.dark_&]:text-slate-200 group-data-[state=open]:text-green-600 [.dark_&]:group-data-[state=open]:text-green-400">
                        {item.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="pl-14 space-y-4">
                      <p className="text-slate-600 [.dark_&]:text-slate-300 lg:text-base leading-relaxed">
                        {item.description}
                      </p>
                      {/* 进度条 */}
                      <div className="h-1 bg-slate-200/50 [.dark_&]:bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-full animate-progress shadow-lg shadow-green-500/20 [.dark_&]:shadow-green-400/30"
                          style={{
                            animationDuration: `${DURATION}ms`,
                          }}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* 图片轮播区域 */}
          <div className="relative">
            {/* 装饰边框 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-green-500/20 [.dark_&]:from-green-400/30 [.dark_&]:via-cyan-400/30 [.dark_&]:to-green-400/30 rounded-2xl blur-xl opacity-60" />
            
            <div className="relative">
              {/* 角落装饰 */}
              <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2 border-green-500/40 [.dark_&]:border-green-400/60 rounded-tr-2xl" />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2 border-cyan-500/40 [.dark_&]:border-cyan-400/60 rounded-bl-2xl" />
              
              <Carousel
                opts={{
                  duration: 50,
                }}
                setApi={setApi}
                plugins={[Fade()]}
                className="w-full"
              >
                <CarouselContent>
                  {section.items?.map((item, i) => (
                    <CarouselItem key={i}>
                      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100/50 to-white/30 [.dark_&]:from-slate-900/50 [.dark_&]:to-slate-800/30 backdrop-blur-sm p-2">
                        <img
                          src={item.image?.src}
                          alt={item.image?.alt || item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {/* 图片遮罩效果 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* 图片计数指示器 */}
              <div className="absolute bottom-4 right-4 bg-black/50 [.dark_&]:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-white">
                  {currentAccordion} / {section.items?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}