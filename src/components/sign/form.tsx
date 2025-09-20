"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SignForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [codeEverSent, setCodeEverSent] = useState(false); // Track if code was ever sent

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Send verification code
  const handleSendCode = async () => {
    if (!email) {
      setError(t("sign_modal.email_required") || "Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        setCodeEverSent(true); // Mark that code has been sent at least once
        setCountdown(60); // 60 seconds countdown
        toast.success(
          t("sign_modal.code_sent") || "Verification code sent to your email"
        );
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Network error, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with verification code
  const handleCodeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      setError(
        t("sign_modal.code_required") ||
          "Please enter email and verification code"
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Directly call signIn without pre-verification
      const result = await signIn("email-code", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth returns "CredentialsSignin" for any credential provider error
        // We can't get the specific error, so show a user-friendly generic message
        const errorMessage =
          t("sign_modal.invalid_code") ||
          "Invalid verification code or expired";
        setError(errorMessage);
      } else if (result?.ok) {
        // Redirect to home or callback URL
        window.location.href = result.url || "/";
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        t("sign_modal.sign_in_failed") || "Sign in failed, please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-green-500/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
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
                  id="google-signup-btn"
                  variant="outline"
                  className="w-full border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10 transition-all duration-300"
                  onClick={() => {
                    setTimeout(() => {
                      signIn("google");
                    }, 300);
                  }}
                >
                  <SiGoogle className="w-4 h-4" />
                  {t("sign_modal.google_sign_in")}
                </Button>
              )}
              {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
                <Button
                  variant="outline"
                  className="w-full border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10 transition-all duration-300"
                  onClick={() => signIn("github")}
                >
                  <SiGithub className="w-4 h-4" />
                  {t("sign_modal.github_sign_in")}
                </Button>
              )}
            </div>

            {process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" &&
              !codeSent && (
                <Button
                  variant="outline"
                  className="w-full border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10 transition-all duration-300"
                  onClick={() => setCodeSent(true)}
                >
                  <Mail className="w-4 h-4" />
                  {t("sign_modal.email_sign_in") || "Continue with Email"}
                </Button>
              )}

            {codeSent &&
              process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED === "true" && (
                <>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      {t("sign_modal.enter_email") || "Enter your email"}
                    </span>
                  </div>

                  {!codeEverSent ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendCode();
                      }}
                      className="grid gap-4"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="email">
                          {t("sign_modal.email") || "Email"}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="border-green-500/20 focus:border-green-500/40 focus:ring-green-500/20"
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-destructive text-center">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("sign_modal.sending_code") || "Sending code..."}
                          </>
                        ) : (
                          t("sign_modal.send_code") || "Send Verification Code"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full hover:bg-green-500/10"
                        onClick={() => {
                          setCodeSent(false);
                          setCodeEverSent(false);
                          setEmail("");
                          setError("");
                        }}
                      >
                        {t("sign_modal.back") || "Back"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleCodeSignIn} className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">
                          {t("sign_modal.email") || "Email"}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={true}
                          className="border-green-500/20 focus:border-green-500/40 focus:ring-green-500/20"
                        />
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="code">
                            {t("sign_modal.verification_code") ||
                              "Verification Code"}
                          </Label>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleSendCode}
                            disabled={isLoading || countdown > 0}
                            className="h-auto p-0 text-xs text-green-500 hover:text-green-600"
                          >
                            {countdown > 0
                              ? `${
                                  t("sign_modal.resend_in") || "Resend in"
                                } ${countdown}s`
                              : t("sign_modal.resend_code") || "Resend code"}
                          </Button>
                        </div>
                        <Input
                          id="code"
                          type="text"
                          placeholder="000000"
                          value={code}
                          onChange={(e) =>
                            setCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          maxLength={6}
                          required
                          disabled={isLoading}
                          className="text-center text-lg tracking-widest border-green-500/20 focus:border-green-500/40 focus:ring-green-500/20"
                          autoFocus
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-destructive text-center">
                          {error}
                        </div>
                      )}

                      <Button
                        id="signup-btn"
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
                        disabled={isLoading || !email || !code}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("sign_modal.signing_in") || "Signing in..."}
                          </>
                        ) : (
                          t("sign_modal.sign_in") || "Sign In"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full hover:bg-green-500/10"
                        onClick={() => {
                          setCodeSent(false);
                          setCodeEverSent(false);
                          setCode("");
                          setEmail("");
                          setError("");
                          setCountdown(0);
                        }}
                      >
                        {t("sign_modal.back") || "Back"}
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
