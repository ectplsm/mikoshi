import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { NeonButton } from "@/components/ui/neon-button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-brand glow-brand text-lg font-bold font-mono tracking-widest hover:opacity-85 transition-opacity"
        >
          MIKOSHI
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                dashboard
              </Link>
              <Link
                href={`/@${(session.user as { username?: string }).username ?? ""}`}
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <NeonButton variant="brand" size="sm" type="submit">
                  logout
                </NeonButton>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <NeonButton variant="brand" size="sm" type="submit">
                sign_in
              </NeonButton>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
