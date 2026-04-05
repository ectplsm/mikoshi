import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground/50 font-mono">
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <Link
            href="/terms"
            className="text-muted-foreground/60 transition-colors hover:text-muted-foreground/80 hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-muted-foreground/60 transition-colors hover:text-muted-foreground/80 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
        <span>Copyright &copy; 2026 Ectplsm Lab</span>
      </div>
    </footer>
  );
}
