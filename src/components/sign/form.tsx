"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SignForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
      });
      if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Email sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("sign_modal.sign_in_title")}
          </CardTitle>
          <CardDescription>
            {t("sign_modal.sign_in_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google")}
                >
                  <SiGoogle className="w-4 h-4" />
                  {t("sign_modal.google_sign_in")}
                </Button>
              )}
              {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("github")}
                >
                  <SiGithub className="w-4 h-4" />
                  {t("sign_modal.github_sign_in")}
                </Button>
              )}
            </div>

            {process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const emailInput = document.getElementById("email") as HTMLInputElement;
                  if (emailInput?.value) {
                    handleEmailSignIn({ preventDefault: () => {} } as React.FormEvent);
                  }
                }}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4" />
                {t("sign_modal.email_sign_in") || "Continue with Email"}
              </Button>
            )}

            {(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" ||
              process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" ||
              process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true") && (
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  {process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" && "Or continue with"}
                </span>
              </div>
            )}

            {process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" && (
              <>
                {emailSent ? (
                  <div className="text-center p-4 border rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      {t("sign_modal.email_sent") || "Check your email for a sign in link!"}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSignIn} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t("sign_modal.email") || "Email"}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t("sign_modal.sending") || "Sending..." : t("sign_modal.send_magic_link") || "Send Magic Link"}
                    </Button>
                  </form>
                )}
              </>
            )}

            {false && (
              <>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </>
            )}

          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our{" "}
        <a href="/terms-of-service" target="_blank">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
