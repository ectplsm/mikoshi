import { Header } from "@/components/layout/header";
import { GlitchText } from "@/components/ui/glitch-text";
import { TerminalCard } from "@/components/ui/terminal-card";
import { auth, signIn } from "@/lib/auth";
import { NeonButton } from "@/components/ui/neon-button";
import { redirect } from "next/navigation";

const HERO_ASCII = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ███╗   ███╗██╗██╗  ██╗ ██████╗ ███████╗██╗  ██╗██╗         ║
║  ████╗ ████║██║██║ ██╔╝██╔═══██╗██╔════╝██║  ██║██║         ║
║  ██╔████╔██║██║█████╔╝ ██║   ██║███████╗███████║██║         ║
║  ██║╚██╔╝██║██║██╔═██╗ ██║   ██║╚════██║██╔══██║██║         ║
║  ██║ ╚═╝ ██║██║██║  ██╗╚██████╔╝███████║██║  ██║██║         ║
║  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝         ║
║                                                              ║
║            CLOUD DATA FORTRESS v0.1.0                        ║
║            Engram Storage & Sharing Hub                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`.trim();

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 scanlines">
        <pre className="text-neon-cyan glow-cyan text-[6px] sm:text-[8px] md:text-xs leading-tight mb-8 select-none text-center overflow-x-auto max-w-full">
          {HERO_ASCII}
        </pre>

        <div className="max-w-xl w-full space-y-6">
          <TerminalCard title="system.init" variant="cyan">
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <span className="text-neon-cyan">&gt;</span> Mikoshi is a cloud
                fortress for storing, sharing, and managing AI persona data
                (Engrams).
              </p>
              <p className="text-muted-foreground">
                <span className="text-neon-cyan">&gt;</span> Upload your Engram
                via CLI or Web UI. Share with the world or keep it private.
              </p>
              <p className="text-muted-foreground">
                <span className="text-neon-cyan">&gt;</span> Clone public
                Engrams from other hackers.
              </p>
            </div>
          </TerminalCard>

          <TerminalCard title="auth.connect" variant="magenta">
            <div className="flex flex-col items-center gap-4 py-4">
              <GlitchText as="p" className="text-lg text-foreground">
                JACK IN TO THE SYSTEM
              </GlitchText>
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <NeonButton variant="cyan" size="lg" type="submit">
                  [ SIGN IN WITH GOOGLE ]
                </NeonButton>
              </form>
            </div>
          </TerminalCard>

          <div className="text-center text-xs text-muted-foreground/50 font-mono">
            PROJECT RELIC // mikoshi.ectplsm.com // v0.1.0
          </div>
        </div>
      </main>
    </div>
  );
}
