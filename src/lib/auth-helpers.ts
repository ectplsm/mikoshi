import { auth } from "@/lib/auth";
import { validateApiKey } from "@/lib/api-key";
import { NextRequest } from "next/server";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Authenticate an API request via Bearer token (API key) or session.
 * Returns the userId if authenticated, null otherwise.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string } | null> {
  // Check for API key in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    return validateApiKey(key);
  }

  // Fall back to session auth
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id };
  }

  return null;
}
