import { Header } from "@/components/layout/header";
import { GlitchText } from "@/components/ui/glitch-text";
import { TerminalCard } from "@/components/ui/terminal-card";
import { CodeBlock } from "@/components/ui/code-block";
import { auth, signIn } from "@/lib/auth";
import { NeonButton } from "@/components/ui/neon-button";
import Link from "next/link";
import { redirect } from "next/navigation";

const HERO_LOGO = [
  "    __  ___ ____ __ __ ____  _____ __ __ ____",
  "   /  |/  //  _// //_// __ \\/ ___// // //  _/",
  "  / /|_/ / / / / ,<  / / / /\\__ \\/ _  / / /  ",
  " / /  / /_/ / / /| |/ /_/ /___/ / // /_/ /  ",
  "/_/  /_//___//_/ |_|\\____//____/_//_//___/  ",
].join("\n");

const HERO_MARK = [
  "                 ___  _ ___",
  "                  \\ \\;|/ /",
  "                   \\_  _/",
  "             _.------||------._",
  "            / _.------------._ \\",
  "  ____     / / :::::@@@@::::: \\ \\     ____",
  " / __ \\   / / :::::@@@@@@::::: \\ \\   / __ \\",
  "/ / _| | / / :::::::@@@@::::::: \\ \\ | |_ \\ \\",
  "\\ \\___/.' / :::::::::::::::::::: \\ `.\\___/ /",
  " \\______.'()(__)(__)(__)(__)(__)()`.______/",
].join("\n");

const HERO_SUB = [
  "",
  " Fortress for Digital Souls",
  "Engram Storage & Sharing Hub",
  "",
].join("\n");

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-8 md:pt-0 scanlines">
        <pre className="text-brand/70 text-[9px] sm:text-[10px] md:text-xs leading-tight mb-6 select-none overflow-x-auto max-w-full">
          {HERO_MARK}
        </pre>
        <pre className="text-brand glow-brand text-xs sm:text-sm md:text-base leading-tight mb-8 select-none overflow-x-auto max-w-full">
          {HERO_LOGO}
        </pre>
        <pre className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-8 select-none">
          {HERO_SUB}
        </pre>

        <div className="max-w-xl w-full space-y-6 pb-8 md:pb-0">
          <TerminalCard title="About Mikoshi" variant="brand">
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <span className="text-brand">&gt;</span> Mikoshi is a cloud
                service for storing and sharing AI Engrams
                (persona and memory), designed to work with{" "}
                <Link
                  href="https://github.com/ectplsm/relic"
                  className="text-brand hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Relic
                </Link>{" "}
                - an AI persona injection system.
              </p>
              <p className="text-muted-foreground">
                <span className="text-brand">&gt;</span> Upload your Engram
                via CLI. Share with the world or keep it private.
              </p>
              <p className="text-muted-foreground">
                <span className="text-brand">&gt;</span> Clone public
                Engrams from other users.
              </p>
              <div className="pt-1">
                <p className="text-xs text-muted-foreground/70 mb-2">
                  Get started with Relic:
                </p>
                <CodeBlock>npm install -g @ectplsm/relic</CodeBlock>
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="Get Started" variant="brand">
            <div className="flex flex-col items-center gap-4 py-4">
              <GlitchText as="p" className="text-lg text-foreground">
                SIGN IN WITH...
              </GlitchText>
              <div className="flex flex-row items-center justify-center gap-3">
                <form
                  action={async () => {
                    "use server";
                    await signIn("google");
                  }}
                >
                  <NeonButton variant="brand" size="lg" type="submit">
                    [ GOOGLE ]
                  </NeonButton>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await signIn("github");
                  }}
                >
                  <NeonButton variant="brand" size="lg" type="submit">
                    [ GITHUB ]
                  </NeonButton>
                </form>
              </div>
              <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground/70">
                Sign in with the same email on Google and GitHub to link
                them. Different emails will create separate accounts.
              </p>
              <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
                By signing in, you agree to the{" "}
                <Link href="/terms" className="text-brand hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </TerminalCard>
        </div>
      </main>
    </div>
  );
}
