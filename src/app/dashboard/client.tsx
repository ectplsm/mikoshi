"use client";

import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

interface DashboardClientProps {
  children: React.ReactNode;
}

export function DashboardClient({ children }: DashboardClientProps) {
  const router = useRouter();

  return (
    <>
      {children}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadZone onUploadComplete={() => router.refresh()} />
        <ApiKeyManager />
      </div>
    </>
  );
}
