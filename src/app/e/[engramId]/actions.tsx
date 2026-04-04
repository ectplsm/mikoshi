"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NeonButton } from "@/components/ui/neon-button";

interface EngramActionsProps {
  engramId: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
}

export function EngramActions({
  engramId,
  isOwner,
  isAuthenticated,
  visibility,
}: EngramActionsProps) {
  const router = useRouter();
  const [cloning, setCloning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await fetch(`/api/v1/engrams/${engramId}/clone`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(data.url);
      }
    } finally {
      setCloning(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this Engram? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/engrams/${engramId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      {isAuthenticated && !isOwner && visibility !== "PRIVATE" && (
        <NeonButton
          variant="brand"
          size="sm"
          onClick={handleClone}
          disabled={cloning}
        >
          {cloning ? "cloning..." : "[ clone ]"}
        </NeonButton>
      )}

      {isOwner && (
        <>
          <NeonButton
            variant="brand"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "deleting..." : "[ delete ]"}
          </NeonButton>
        </>
      )}
    </div>
  );
}
