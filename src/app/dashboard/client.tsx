"use client";

import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

interface DashboardClientProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <>
      {children}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiKeyManager />
      </div>
    </>
  );
}
