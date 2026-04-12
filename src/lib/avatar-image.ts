import sharp from "sharp";
import {
  AVATAR_MAX_DIMENSION,
  AVATAR_OUTPUT_SIZE,
  isAllowedAvatarMimeType,
} from "@/lib/avatar";

export class AvatarValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvatarValidationError";
  }
}

interface NormalizedAvatar {
  bytes: Buffer;
  mimeType: "image/webp";
  width: number;
  height: number;
}

export async function normalizeProfileAvatar(
  inputBytes: Buffer,
  mimeType: string
): Promise<NormalizedAvatar> {
  if (!isAllowedAvatarMimeType(mimeType)) {
    throw new AvatarValidationError("Only JPEG, PNG, and WebP are allowed.");
  }

  const image = sharp(inputBytes, {
    failOn: "error",
    limitInputPixels: AVATAR_MAX_DIMENSION * AVATAR_MAX_DIMENSION,
  }).rotate();

  let metadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new AvatarValidationError("Could not read that image. Try a different file.");
  }

  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
    throw new AvatarValidationError("Only JPEG, PNG, and WebP are allowed.");
  }

  if (!metadata.width || !metadata.height) {
    throw new AvatarValidationError("Could not read that image. Try a different file.");
  }

  if (
    metadata.width > AVATAR_MAX_DIMENSION ||
    metadata.height > AVATAR_MAX_DIMENSION
  ) {
    throw new AvatarValidationError(
      `Image dimensions must be ${AVATAR_MAX_DIMENSION}x${AVATAR_MAX_DIMENSION} or smaller.`
    );
  }

  const { data, info } = await image
    .resize(AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .webp({ quality: 86 })
    .toBuffer({ resolveWithObject: true });

  return {
    bytes: data,
    mimeType: "image/webp",
    width: info.width,
    height: info.height,
  };
}
