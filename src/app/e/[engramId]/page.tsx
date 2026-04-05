import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { filterPersonaFiles } from "@/lib/engram-privacy";
import { Header } from "@/components/layout/header";
import { EngramViewer } from "@/components/engram/engram-viewer";
import { VisibilityBadge } from "@/components/ui/visibility-badge";
import { TerminalCard } from "@/components/ui/terminal-card";
import { MemoryStatus } from "@/components/engram/memory-status";
import { EngramCardActions } from "./actions";
import { Visibility } from "@/generated/prisma/enums";
import { formatDateUtc } from "@/lib/utils";

interface PageProps {
  params: Promise<{ engramId: string }>;
}

export default async function EngramPage({ params }: PageProps) {
  const { engramId } = await params;
  const session = await auth();

  const engram = await db.engram.findUnique({
    where: { id: engramId },
    include: {
      personaFiles: true,
      memoryBlob: { select: { updatedAt: true, manifestJson: true } },
      owner: { select: { username: true, name: true, image: true } },
    },
  });

  if (!engram) notFound();

  const isOwner = session?.user?.id === engram.ownerId;

  // Access control
  if (engram.visibility === Visibility.PRIVATE && !isOwner) {
    notFound();
  }

  const visibleFiles = filterPersonaFiles(engram.personaFiles, isOwner);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Engram header */}
        <div className="relative">
          <TerminalCard
            title="Engram Details"
            variant="brand"
            titleActions={
              <EngramCardActions
                engramId={engram.id}
                isOwner={isOwner}
                isAuthenticated={!!session?.user}
                visibility={engram.visibility}
              />
            }
          >
            <div className="flex items-start gap-4">
              {engram.avatarUrl && (
                <Image
                  src={engram.avatarUrl}
                  alt=""
                  className="w-16 h-16 rounded-sm border border-border object-cover"
                  width={64}
                  height={64}
                  unoptimized
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold">{engram.name}</h1>
                  <VisibilityBadge visibility={engram.visibility} />
                </div>
                {engram.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {engram.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                  <span>
                    by{" "}
                    <a
                      href={`/@${engram.owner.username}`}
                      className="text-brand hover:underline"
                    >
                      @{engram.owner.username}
                    </a>
                  </span>
                  <span>
                    created{" "}
                    {formatDateUtc(engram.createdAt)}
                  </span>
                  <span>
                    updated{" "}
                    {formatDateUtc(engram.updatedAt)}
                  </span>
                </div>
                {engram.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {engram.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-brand/70 border border-brand/20 px-1.5 py-0.5 rounded-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TerminalCard>
        </div>

        {/* Owner-only memory status */}
        {isOwner && (
          <div className="mt-6">
            <MemoryStatus
              hasMemory={!!engram.memoryBlob}
              manifest={engram.memoryBlob?.manifestJson as Record<string, unknown> | null}
              memoryUpdatedAt={engram.memoryBlob?.updatedAt?.toISOString() ?? null}
            />
          </div>
        )}

        {/* Persona file viewer */}
        <div className="mt-6">
          <EngramViewer
            files={visibleFiles.map((f) => ({
              fileType: f.fileType,
              filename: f.filename,
              content: f.content,
            }))}
          />
        </div>
      </main>
    </div>
  );
}
