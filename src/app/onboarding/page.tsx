import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUsernameEmpty } from "@/lib/username";
import { UsernameSetup } from "./username-setup";

export default async function OnboardingPage() {
  const session = await auth();

  // Not logged in → home
  if (!session?.user?.id) redirect("/");

  // Already has a username → dashboard
  if (!isUsernameEmpty(session.user.username)) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            <span className="text-brand">&gt;</span> Choose your username
          </h1>
          <p className="text-sm text-muted-foreground">
            This will be your permanent profile URL.
          </p>
        </div>

        {/* Username form */}
        <UsernameSetup />
      </div>
    </div>
  );
}
