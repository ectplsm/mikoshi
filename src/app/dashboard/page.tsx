import { db } from "@/lib/db";
import { requireUsername } from "@/lib/require-username";
import { Header } from "@/components/layout/header";
import { EngramCard } from "@/components/dashboard/engram-card";
import { CodeBlock } from "@/components/ui/code-block";

export default async function DashboardPage() {
  const session = await requireUsername();

  const engrams = await db.engram.findMany({
    where: { ownerId: session.user.id },
    include: { memoryBlob: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-brand">&gt;</span>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <span className="text-muted-foreground text-sm">
            {"//"} {engrams.length} engram{engrams.length !== 1 ? "s" : ""}
          </span>
        </div>

        {engrams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                hasMemory={!!e.memoryBlob}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <p className="text-sm text-muted-foreground/50">
              &gt; no engrams found
            </p>
            <div className="inline-block text-left">
              <p className="text-xs text-muted-foreground mb-2">
                Push your Engram from Relic:
              </p>
              <CodeBlock>relic mikoshi push --engram your-engram</CodeBlock>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
