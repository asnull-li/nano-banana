import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border text-primary-foreground">
            <img src="/logo.png" alt="logo" className="size-4" />
          </div>
          {process.env.NEXT_PUBLIC_PROJECT_NAME}
        </a>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              A sign in link has been sent to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              <p>Click the link in the email to sign in to your account.</p>
              <p className="mt-4">
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}