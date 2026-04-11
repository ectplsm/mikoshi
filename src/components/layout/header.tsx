import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { NeonButton } from "@/components/ui/neon-button";
import { MobileMenu } from "./mobile-menu";

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

        {session?.user ? (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                dashboard
              </Link>
              <Link
                href={`/@${session.user.username}`}
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                profile
              </Link>
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                settings
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
            </nav>

            {/* Mobile menu */}
            <MobileMenu username={session.user.username ?? ""} />
          </>
        ) : (
          <Link href="/">
            <NeonButton variant="brand" size="sm" type="button">
              sign_in
            </NeonButton>
          </Link>
        )}
      </div>
    </header>
  );
}
