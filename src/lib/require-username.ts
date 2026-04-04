import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUsernameEmpty } from "@/lib/username";

/**
 * Server-side guard for pages that require a confirmed username.
 * Redirects to login if unauthenticated, or to onboarding if username is empty.
 * Returns the session on success.
 */
export async function requireUsername() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  if (isUsernameEmpty(session.user.username)) redirect("/onboarding");
  return session;
}
