import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { EngramCard } from "@/components/dashboard/engram-card";
import { TerminalCard } from "@/components/ui/terminal-card";
import { Visibility } from "@/generated/prisma/enums";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  const user = await db.user.findUnique({
    where: { username },
    include: {
      engrams: {
        where: { visibility: Visibility.PUBLIC },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <TerminalCard title={`user.profile @${user.username}`} variant="cyan">
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt=""
                className="w-16 h-16 rounded-sm border border-border object-cover"
                width={64}
                height={64}
                unoptimized
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{user.name ?? user.username}</h1>
              <p className="text-sm text-neon-cyan">@{user.username}</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                member since {user.createdAt.toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </TerminalCard>

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-neon-cyan">&gt;</span>
            <h2 className="text-sm font-bold">
              Public Engrams ({user.engrams.length})
            </h2>
          </div>

          {user.engrams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.engrams.map((e) => (
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
            <p className="text-sm text-muted-foreground/50">
              &gt; no public engrams
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
