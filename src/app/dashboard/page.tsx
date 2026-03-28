import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { EngramCard } from "@/components/dashboard/engram-card";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const engrams = await db.engram.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-neon-cyan">&gt;</span>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <span className="text-muted-foreground text-sm">
            {"//"} {engrams.length} engram{engrams.length !== 1 ? "s" : ""}
          </span>
        </div>

        <DashboardClient>
          {engrams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {engrams.map((e) => (
                <EngramCard
                  key={e.id}
                  id={e.id}
                  name={e.name}
                  description={e.description}
                  visibility={e.visibility}
                  tags={e.tags}
                  avatarUrl={e.avatarUrl}
                  updatedAt={e.updatedAt.toISOString()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <pre className="text-neon-cyan/20 text-xs mb-4">
                {`  ┌──────────────────┐
  │  NO ENGRAMS FOUND │
  │  upload your first │
  │  engram below      │
  └──────────────────┘`}
              </pre>
            </div>
          )}
        </DashboardClient>
      </main>
    </div>
  );
}
