"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SiGithub, SiGmail, SiGoogle } from "react-icons/si";
import { Sparkles, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SignModal() {
  const t = useTranslations();
  const { showSignModal, setShowSignModal } = useAppContext();

  // const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
          <div className="relative bg-gradient-to-br from-green-500/10 to-cyan-500/10 p-8 border-b border-green-500/20">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-green-500/20 rounded-full blur-2xl transform -translate-x-12 translate-y-12" />

            <DialogHeader className="space-y-4 relative z-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
                {t("sign_modal.sign_in_title")}
              </DialogTitle>

              <DialogDescription className="text-center text-muted-foreground">
                {t("sign_modal.sign_in_description")}
              </DialogDescription>

              <div className="flex items-center justify-center">
                <Badge className="bg-gradient-to-r from-green-500/90 to-cyan-500/90 text-white border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <Gift className="h-3 w-3 mr-1" />
                  {t("sign_modal.login_slogan")}
                </Badge>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8">
            <ProfileForm />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSignModal} onOpenChange={setShowSignModal}>
      <DrawerContent className="max-h-[90vh]">
        <div className="relative bg-gradient-to-br from-green-500/10 to-cyan-500/10 px-4 pt-8 pb-6 border-b border-green-500/20">
          {/* Background pattern for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />

          <DrawerHeader className="text-center px-0 relative z-10">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 mb-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
              {t("sign_modal.sign_in_title")}
            </DrawerTitle>

            <DrawerDescription className="text-muted-foreground mt-2">
              {t("sign_modal.sign_in_description")}
            </DrawerDescription>

            <div className="flex items-center justify-center mt-4">
              <Badge className="bg-gradient-to-r from-green-500/90 to-cyan-500/90 text-white border-0 shadow-md">
                <Gift className="h-3 w-3 mr-1" />
                {t("sign_modal.login_slogan")}
              </Badge>
            </div>
          </DrawerHeader>
        </div>

        <ProfileForm className="px-4 pt-6" />

        <DrawerFooter className="pt-4 pb-6">
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200"
            >
              {t("sign_modal.cancel_title")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const t = useTranslations();

  return (
    <div className={cn("grid items-start gap-4", className)}>
      {/* <div className="grid gap-2">
        <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
        <Input type="email" id="email" placeholder="xxx@xxx.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{t("sign_modal.password_title")}</Label>
        <Input id="password" type="password" />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2">
        <SiGmail className="w-4 h-4" />
        {t("sign_modal.email_sign_in")}
      </Button> */}

      <div className="space-y-4">
        {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 transition-all duration-300 group shadow-sm hover:shadow-md"
            onClick={() => {
              signIn("google");
            }}
          >
            <SiGoogle className="w-5 h-5 text-[#4285f4] group-hover:scale-110 transition-transform duration-200" />
            <span className="group-hover:text-green-600 transition-colors duration-200">
              {t("sign_modal.google_sign_in")}
            </span>
          </Button>
        )}

        {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium border-green-500/20 hover:border-green-500/40 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-cyan-500/10 transition-all duration-300 group shadow-sm hover:shadow-md"
            onClick={() => {
              signIn("github");
            }}
          >
            <SiGithub className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="group-hover:text-green-600 transition-colors duration-200">
              {t("sign_modal.github_sign_in")}
            </span>
          </Button>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            {t("sign_modal.terms_text")}{" "}
            <Link
              href="/terms-of-service"
              className="text-green-600 hover:text-green-700 underline underline-offset-2 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("sign_modal.terms_of_service")}
            </Link>{" "}
            {t("sign_modal.and")}{" "}
            <Link
              href="/privacy-policy"
              className="text-green-600 hover:text-green-700 underline underline-offset-2 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("sign_modal.privacy_policy")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
