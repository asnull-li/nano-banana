"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Header as HeaderType } from "@/types/blocks/header";
import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";
import LocaleToggle from "@/components/locale/toggle";
import { Menu } from "lucide-react";
import SignToggle from "@/components/sign/toggle";
import ThemeToggle from "@/components/theme/toggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Header({ header }: { header: HeaderType }) {
  if (header.disabled) {
    return null;
  }

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "py-2 bg-white/80 [.dark_&]:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 [.dark_&]:shadow-slate-950/50" 
        : "py-4 bg-white/60 [.dark_&]:bg-slate-950/60 backdrop-blur-lg"
    )}>
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent [.dark_&]:via-green-400/60" />
      
      <div className="w-full px-4 md:px-6 lg:px-8">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link
              href={(header.brand?.url as any) || "/"}
              className="group flex items-center gap-2 transition-transform hover:scale-105"
            >
              {header.brand?.logo?.src && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={header.brand.logo.src}
                    alt={header.brand.logo.alt || header.brand.title}
                    className="relative w-8 h-8"
                  />
                </div>
              )}
              {header.brand?.title && (
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
                  {header.brand?.title || ""}
                </span>
              )}
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {header.nav?.items?.map((item, i) => {
                    if (item.children && item.children.length > 0) {
                      return (
                        <NavigationMenuItem
                          key={i}
                          className="text-slate-600 [.dark_&]:text-slate-300"
                        >
                          <NavigationMenuTrigger className="hover:text-green-600 [.dark_&]:hover:text-green-400 transition-colors">
                            {item.icon && (
                              <Icon
                                name={item.icon}
                                className="size-4 shrink-0 mr-2"
                              />
                            )}
                            <span>{item.title}</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="w-80 p-3 bg-white/95 [.dark_&]:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 [.dark_&]:border-slate-700/50">
                              <NavigationMenuLink>
                                {item.children.map((iitem, ii) => (
                                  <li key={ii}>
                                    <Link
                                      className={cn(
                                        "flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-all hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 [.dark_&]:hover:from-green-400/20 [.dark_&]:hover:to-cyan-400/20 hover:text-green-600 [.dark_&]:hover:text-green-400"
                                      )}
                                      href={iitem.url as any}
                                      target={iitem.target}
                                    >
                                      {iitem.icon && (
                                        <Icon
                                          name={iitem.icon}
                                          className="size-5 shrink-0 text-green-500 [.dark_&]:text-green-400"
                                        />
                                      )}
                                      <div>
                                        <div className="text-sm font-semibold mb-1">
                                          {iitem.title}
                                        </div>
                                        <p className="text-sm leading-snug text-slate-500 [.dark_&]:text-slate-400">
                                          {iitem.description}
                                        </p>
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </NavigationMenuLink>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={i}>
                        <Link
                          className={cn(
                            "text-slate-600 [.dark_&]:text-slate-300 hover:text-green-600 [.dark_&]:hover:text-green-400 transition-colors",
                            navigationMenuTriggerStyle,
                            buttonVariants({
                              variant: "ghost",
                            })
                          )}
                          href={item.url as any}
                          target={item.target}
                        >
                          {item.icon && (
                            <Icon
                              name={item.icon}
                              className="size-4 shrink-0 mr-2"
                            />
                          )}
                          {item.title}
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="shrink-0 flex gap-2 items-center">
            {header.show_locale && <LocaleToggle />}
            {header.show_theme && <ThemeToggle />}

            {header.buttons?.map((item, i) => {
              const isPrimary = i === 0;
              return (
                <Button 
                  key={i} 
                  variant={item.variant}
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    isPrimary 
                      ? "bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 text-white hover:shadow-lg hover:shadow-green-500/25 [.dark_&]:hover:shadow-green-400/25 hover:scale-105"
                      : "border-green-500/30 [.dark_&]:border-green-400/40 hover:border-green-500 [.dark_&]:hover:border-green-400"
                  )}
                >
                  <Link
                    href={item.url as any}
                    target={item.target || ""}
                    className="relative z-10 flex items-center gap-1 cursor-pointer"
                  >
                    {item.title}
                    {item.icon && (
                      <Icon name={item.icon} className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </Link>
                  {isPrimary && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-green-500 [.dark_&]:from-cyan-400 [.dark_&]:to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Button>
              );
            })}
            {header.show_sign && <SignToggle />}
          </div>
        </nav>

        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href={(header.brand?.url || "/") as any}
              className="group flex items-center gap-2 transition-transform hover:scale-105"
            >
              {header.brand?.logo?.src && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={header.brand.logo.src}
                    alt={header.brand.logo.alt || header.brand.title}
                    className="relative w-8 h-8"
                  />
                </div>
              )}
              {header.brand?.title && (
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
                  {header.brand?.title || ""}
                </span>
              )}
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon"
                  className="bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 text-white hover:shadow-lg hover:shadow-green-500/25 [.dark_&]:hover:shadow-green-400/25"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto bg-white/95 [.dark_&]:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/50 [.dark_&]:border-slate-700/50">
                <SheetHeader>
                  <SheetTitle>
                    <Link
                      href={(header.brand?.url || "/") as any}
                      className="flex items-center gap-2"
                    >
                      {header.brand?.logo?.src && (
                        <img
                          src={header.brand.logo.src}
                          alt={header.brand.logo.alt || header.brand.title}
                          className="w-8"
                        />
                      )}
                      {header.brand?.title && (
                        <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
                          {header.brand?.title || ""}
                        </span>
                      )}
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="mb-8 mt-8 flex flex-col gap-4">
                  <Accordion type="single" collapsible className="w-full">
                    {header.nav?.items?.map((item, i) => {
                      if (item.children && item.children.length > 0) {
                        return (
                          <AccordionItem
                            key={i}
                            value={item.title || ""}
                            className="border-b border-slate-200/50 [.dark_&]:border-slate-700/50"
                          >
                            <AccordionTrigger className="mb-4 py-0 font-semibold hover:no-underline text-left hover:text-green-600 [.dark_&]:hover:text-green-400 transition-colors">
                              {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="mt-2">
                              {item.children.map((iitem, ii) => (
                                <Link
                                  key={ii}
                                  className={cn(
                                    "flex select-none gap-4 rounded-md p-3 leading-none outline-hidden transition-all hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 [.dark_&]:hover:from-green-400/20 [.dark_&]:hover:to-cyan-400/20"
                                  )}
                                  href={iitem.url as any}
                                  target={iitem.target}
                                >
                                  {iitem.icon && (
                                    <Icon
                                      name={iitem.icon}
                                      className="size-4 shrink-0 text-green-500 [.dark_&]:text-green-400"
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-semibold">
                                      {iitem.title}
                                    </div>
                                    <p className="text-sm leading-snug text-slate-500 [.dark_&]:text-slate-400">
                                      {iitem.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      }
                      return (
                        <Link
                          key={i}
                          href={item.url as any}
                          target={item.target}
                          className="font-semibold my-4 flex items-center gap-2 px-4 hover:text-green-600 [.dark_&]:hover:text-green-400 transition-colors"
                        >
                          {item.icon && (
                            <Icon
                              name={item.icon}
                              className="size-4 shrink-0"
                            />
                          )}
                          {item.title}
                        </Link>
                      );
                    })}
                  </Accordion>
                </div>
                <div className="flex-1"></div>
                <div className="border-t border-slate-200/50 [.dark_&]:border-slate-700/50 pt-4">
                  <div className="mt-2 flex flex-col gap-3">
                    {header.buttons?.map((item, i) => {
                      const isPrimary = i === 0;
                      return (
                        <Button 
                          key={i} 
                          variant={item.variant}
                          className={cn(
                            isPrimary 
                              ? "bg-gradient-to-r from-green-500 to-cyan-500 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 text-white"
                              : ""
                          )}
                        >
                          <Link
                            href={item.url as any}
                            target={item.target || ""}
                            className="flex items-center gap-1"
                          >
                            {item.title}
                            {item.icon && (
                              <Icon
                                name={item.icon}
                                className="size-4 shrink-0"
                              />
                            )}
                          </Link>
                        </Button>
                      );
                    })}

                    {header.show_sign && <SignToggle />}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {header.show_locale && <LocaleToggle />}
                    <div className="flex-1"></div>

                    {header.show_theme && <ThemeToggle />}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

    </section>
  );
}