import SignForm from "@/components/sign/form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  if (!isAuthEnabled()) {
    return redirect("/");
  }

  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-950 dark:to-black p-6 md:p-10">
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-cyan-500 shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-all duration-300 group-hover:scale-110">
            <img src="/logo.png" alt="logo" className="size-5 brightness-0 invert" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            {process.env.NEXT_PUBLIC_PROJECT_NAME}
          </span>
        </a>
        <SignForm />
      </div>
    </div>
  );
}
