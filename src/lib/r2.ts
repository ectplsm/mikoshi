import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "mikoshi-avatars";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

/**
 * Upload an avatar image to Cloudflare R2.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatar(
  engramId: string,
  data: Buffer,
  mimeType: string
): Promise<string> {
  const ext = mimeType.split("/")[1] ?? "png";
  const key = `avatars/${engramId}.${ext}`;

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
 * Delete an avatar image from Cloudflare R2.
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const key = avatarUrl.replace(`${PUBLIC_URL}/`, "");

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
