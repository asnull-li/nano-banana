"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "@/i18n/navigation";
import { User } from "@/types/user";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { NavItem } from "@/types/blocks/base";

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();

  const dropdownItems: NavItem[] = [
    // {
    //   title: t("user.user_center"),
    //   url: "/my-orders",
    // },
    // {
    //   title: t("user.admin_system"),
    //   url: "/admin/users",
    // },
    {
      title: t("user.sign_out"),
      onClick: () => signOut(),
    },
  ];

  // 获取用户名首字母作为头像备用显示
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200">
          <Avatar className="h-10 w-10 ring-2 ring-border/10 hover:ring-border/30 transition-all duration-200">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.nickname} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {getInitials(user.nickname)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <div className="text-sm font-medium text-foreground leading-none">
              {user.nickname}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {user.email}
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl"
        align="end"
        sideOffset={8}
      >
        {/* 用户信息头部 */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.nickname} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getInitials(user.nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="font-medium text-card-foreground text-sm">
                {user.nickname}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              {user.credits && (
                <div className="text-xs text-muted-foreground mt-1">
                  {user.credits.left_credits} {t("user.credits")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="py-1">
          {dropdownItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-accent/50 focus:bg-accent/50 transition-colors"
            >
              {item.url ? (
                <Link
                  href={item.url as any}
                  target={item.target}
                  className="flex items-center w-full text-sm text-card-foreground"
                >
                  {item.title}
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className="flex items-center w-full text-sm text-card-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </button>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
