"use client";

import { useId, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { NeonButton } from "@/components/ui/neon-button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
} from "@/lib/avatar";
import { cropImageToBlob } from "@/lib/crop-image";

interface ProfileAvatarControlProps {
  username: string;
  currentImageUrl: string | null;
}

type StatusMessage =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export function ProfileAvatarControl({
  username,
  currentImageUrl,
}: ProfileAvatarControlProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMimeType, setCropMimeType] = useState<string>("image/webp");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);

  const maxMb = Math.floor(AVATAR_MAX_BYTES / (1024 * 1024));

  const resetCropState = () => {
    if (cropSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    setCropMimeType("image/webp");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const openFilePicker = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
      setMessage({ type: "error", text: "Only JPEG, PNG, and WebP are allowed." });
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      setMessage({ type: "error", text: `File must be ${maxMb}MB or smaller.` });
      return;
    }

    if (cropSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(cropSrc);
    }

    setMessage(null);
    setCropMimeType(file.type);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropSrc(URL.createObjectURL(file));
  };

  const uploadCroppedImage = async () => {
    if (!cropSrc || !croppedAreaPixels) return;

    setUploading(true);
    setMessage(null);

    try {
      const blob = await cropImageToBlob(cropSrc, croppedAreaPixels, cropMimeType);
      const extension = blob.type === "image/png" ? "png" : "webp";
      const file = new File([blob], `avatar.${extension}`, { type: blob.type });
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/v1/me/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: payload?.error ?? "Upload failed. Try again.",
        });
        return;
      }

      setImageUrl(payload?.imageUrl ?? null);
      setMessage({ type: "success", text: "Profile image updated." });
      resetCropState();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Upload failed. Try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    setMenuOpen(false);
    setRemoving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/me/avatar", {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage({
          type: "error",
          text: payload?.error ?? "Could not remove image.",
        });
        return;
      }

      setImageUrl(null);
      setMessage({ type: "success", text: "Profile image removed." });
    } catch {
      setMessage({ type: "error", text: "Could not remove image." });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground font-medium">Avatar</div>

      <div className="relative inline-block">
        {menuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close avatar menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <button
          type="button"
          className="relative z-20 block rounded-sm focus:outline-none focus:ring-2 focus:ring-brand/60"
          onClick={() => setMenuOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={uploading || removing}
        >
          <UserAvatar
            username={username}
            imageUrl={imageUrl}
            size="xl"
            className="transition-colors hover:border-brand/60"
          />
          <span className="absolute inset-x-0 bottom-0 border-t border-brand/30 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-brand">
            edit
          </span>
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 min-w-44 rounded-sm border border-brand/30 bg-card p-1 shadow-lg shadow-black/30">
            <button
              type="button"
              className="block w-full rounded-sm px-3 py-2 text-left text-xs text-foreground hover:bg-brand/10"
              onClick={openFilePicker}
            >
              upload image
            </button>
            {imageUrl && (
              <button
                type="button"
                className="block w-full rounded-sm px-3 py-2 text-left text-xs text-destructive hover:bg-destructive/10"
                onClick={removeAvatar}
                disabled={removing}
              >
                {removing ? "removing..." : "remove image"}
              </button>
            )}
          </div>
        )}

        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ALLOWED_MIME_TYPES.join(",")}
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <p className="text-[10px] text-muted-foreground/60">
        JPEG, PNG, or WebP. Max {maxMb}MB.
      </p>

      {message && (
        <p
          className={`text-xs ${
            message.type === "success"
              ? "text-neon-green"
              : "text-destructive/80"
          }`}
        >
          &gt; {message.text}
        </p>
      )}

      {cropSrc && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => {
              if (!uploading) resetCropState();
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand/30 bg-card p-4 shadow-xl shadow-black/40">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground font-medium">
                  Crop Profile Image
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/60">
                  Drag the image and adjust zoom to choose the square crop.
                </p>
              </div>

              <div className="relative h-72 overflow-hidden rounded-sm border border-border bg-black">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  objectFit="horizontal-cover"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                />
              </div>

              <label className="block space-y-2 text-xs text-muted-foreground">
                <span>Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
              </label>

              <div className="flex justify-end gap-2">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={resetCropState}
                  disabled={uploading}
                >
                  cancel
                </NeonButton>
                <NeonButton
                  variant="brand"
                  size="sm"
                  onClick={uploadCroppedImage}
                  disabled={uploading || !croppedAreaPixels}
                >
                  {uploading ? "uploading..." : "apply"}
                </NeonButton>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

