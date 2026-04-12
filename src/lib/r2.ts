import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.R2_BUCKET_NAME ?? "mikoshi-avatars";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

function createClient() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getClient() {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }
  return createClient();
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_PUBLIC_URL
  );
}

/**
 * Upload a normalized user avatar image to Cloudflare R2.
 */
export async function uploadUserAvatar(
  userId: string,
  data: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType.split("/")[1] ?? "webp";
  const key = `users/${userId}/avatar-${Date.now()}.${ext}`;
  const s3 = getClient();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      ContentType: mimeType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Delete a Mikoshi-managed avatar image from Cloudflare R2.
 */
export async function deleteManagedAvatarByUrl(avatarUrl: string): Promise<void> {
  if (!PUBLIC_URL || !avatarUrl.startsWith(`${PUBLIC_URL}/`)) return;
  if (!isR2Configured()) return;

  const key = avatarUrl.replace(`${PUBLIC_URL}/`, "");
  const s3 = getClient();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
