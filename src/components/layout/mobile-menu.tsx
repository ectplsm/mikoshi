"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { NeonButton } from "@/components/ui/neon-button";

interface MobileMenuProps {
  username: string;
}

export function MobileMenu({ username }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <NeonButton
        variant="ghost"
        size="sm"
        className="px-1.5 py-0.5"
        onClick={() => setOpen((v) => !v)}
      >
        [ menu ]
      </NeonButton>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 z-50 w-48 border border-brand/30 bg-card rounded-sm shadow-lg shadow-brand/5 py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm font-mono text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors"
            >
              dashboard
            </Link>
            <Link
              href={`/@${username}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm font-mono text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors"
            >
              profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm font-mono text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors"
            >
              settings
            </Link>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm font-mono text-muted-foreground hover:text-brand hover:bg-brand/5 transition-colors cursor-pointer"
            >
              logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
