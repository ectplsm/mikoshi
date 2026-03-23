import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { NeonButton } from "@/components/ui/neon-button";

const ASCII_LOGO = `
 ███╗   ███╗██╗██╗  ██╗ ██████╗ ███████╗██╗  ██╗██╗
 ████╗ ████║██║██║ ██╔╝██╔═══██╗██╔════╝██║  ██║██║
 ██╔████╔██║██║█████╔╝ ██║   ██║███████╗███████║██║
 ██║╚██╔╝██║██║██╔═██╗ ██║   ██║╚════██║██╔══██║██║
 ██║ ╚═╝ ██║██║██║  ██╗╚██████╔╝███████║██║  ██║██║
 ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝`.trim();

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <pre className="text-[5px] leading-[5px] text-neon-cyan glow-cyan hidden sm:block group-hover:text-neon-magenta transition-colors">
            {ASCII_LOGO}
          </pre>
          <span className="text-neon-cyan glow-cyan text-lg font-bold sm:hidden">
            MIKOSHI
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                dashboard
              </Link>
              <Link
                href={`/@${(session.user as { username?: string }).username ?? ""}`}
                className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <NeonButton variant="magenta" size="sm" type="submit">
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
              <NeonButton variant="cyan" size="sm" type="submit">
                sign_in
              </NeonButton>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
