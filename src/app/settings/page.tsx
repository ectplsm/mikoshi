import { requireUsername } from "@/lib/require-username";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

export default async function SettingsPage() {
  const session = await requireUsername();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-brand">&gt;</span>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ProfileEditor
            currentUsername={session.user.username}
            currentDisplayName={session.user.name ?? ""}
            currentImageUrl={user?.image ?? null}
          />
          <ApiKeyManager />
        </div>
      </main>
    </div>
  );
}
