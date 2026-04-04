import Link from "next/link";
import { NeonButton } from "@/components/ui/neon-button";

const ASCII_404 = `
 ██╗  ██╗ ██████╗ ██╗  ██╗
 ██║  ██║██╔═══██╗██║  ██║
 ███████║██║   ██║███████║
 ╚════██║██║   ██║╚════██║
      ██║╚██████╔╝     ██║
      ╚═╝ ╚═════╝      ╚═╝`.trim();

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 scanlines">
      <pre className="text-brand glow-brand text-xs sm:text-sm leading-tight mb-6 select-none">
        {ASCII_404}
      </pre>
      <p className="text-sm text-muted-foreground mb-6">
        &gt; ERROR: requested resource not found in the system
      </p>
      <Link href="/">
        <NeonButton variant="brand">[ return to base ]</NeonButton>
      </Link>
    </div>
  );
}
