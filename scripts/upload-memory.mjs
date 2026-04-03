#!/usr/bin/env node
/**
 * Encrypt and upload memory files to Mikoshi.
 *
 * Usage:
 *   node scripts/upload-memory.mjs \
 *     --engram-dir ~/.relic/engrams/rebel \
 *     --engram-id <mikoshi-engram-id> \
 *     --api-key <your-api-key> \
 *     --passphrase <encryption-passphrase> \
 *     [--base-url http://localhost:3000]
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash, randomBytes, scryptSync, createCipheriv } from "node:crypto";

// ─── CLI args ───

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

const engramDir = arg("engram-dir");
const engramId = arg("engram-id");
const apiKey = arg("api-key");
const passphrase = arg("passphrase");
const baseUrl = arg("base-url") ?? "http://localhost:3000";

if (!engramDir || !engramId || !apiKey || !passphrase) {
  console.error("Usage: node scripts/upload-memory.mjs --engram-dir <dir> --engram-id <id> --api-key <key> --passphrase <pass>");
  process.exit(1);
}

// ─── Collect memory files ───

const files = {};

const userPath = join(engramDir, "USER.md");
if (existsSync(userPath)) {
  files["USER.md"] = readFileSync(userPath, "utf-8");
}

const memoryIndexPath = join(engramDir, "MEMORY.md");
if (existsSync(memoryIndexPath)) {
  files["MEMORY.md"] = readFileSync(memoryIndexPath, "utf-8");
}

const memoryDir = join(engramDir, "memory");
if (existsSync(memoryDir)) {
  for (const name of readdirSync(memoryDir).sort()) {
    if (name.endsWith(".md")) {
      files[`memory/${name}`] = readFileSync(join(memoryDir, name), "utf-8");
    }
  }
}

const fileCount = Object.keys(files).length;
if (fileCount === 0) {
  console.error("No memory files found in", engramDir);
  process.exit(1);
}

console.log(`Found ${fileCount} memory files`);

// ─── Build plaintext bundle ───

const bundle = JSON.stringify(files);
const bundleBuffer = Buffer.from(bundle, "utf-8");

// ─── Derive key from passphrase via scrypt ───

const kdfSalt = randomBytes(32);
const kdfParams = { N: 16384, r: 8, p: 1, dkLen: 32 };
const rootKey = scryptSync(passphrase, kdfSalt, kdfParams.dkLen, {
  N: kdfParams.N,
  r: kdfParams.r,
  p: kdfParams.p,
});

// ─── Generate random bundle key and wrap it ───

const bundleKey = randomBytes(32);

// Wrap bundle key with root key using AES-256-GCM
const wrapNonce = randomBytes(12);
const wrapCipher = createCipheriv("aes-256-gcm", rootKey, wrapNonce);
const wrappedPart = wrapCipher.update(bundleKey);
wrapCipher.final();
const wrapTag = wrapCipher.getAuthTag();
const wrappedBundleKey = Buffer.concat([wrapNonce, wrappedPart, wrapTag]);

// ─── Encrypt bundle with bundle key ───

const cipherNonce = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", bundleKey, cipherNonce);
const encrypted = cipher.update(bundleBuffer);
cipher.final();
const authTag = cipher.getAuthTag();
const ciphertext = Buffer.concat([encrypted, authTag]);

// ─── Hash ───

const bundleHash = "sha256:" + createHash("sha256").update(ciphertext).digest("hex");

// ─── Build manifest ───

const memoryEntries = Object.keys(files).filter((k) => k.startsWith("memory/"));
const dates = memoryEntries.map((k) => k.replace("memory/", "").replace(".md", "")).sort();

const manifest = {
  payloadKind: "memory",
  bundleVersion: 1,
  hasUserFile: "USER.md" in files,
  hasMemoryIndex: "MEMORY.md" in files,
  memoryEntryCount: memoryEntries.length,
  latestMemoryDate: dates.length > 0 ? dates[dates.length - 1] : null,
};

// ─── Build upload payload ───

const payload = {
  ciphertext: ciphertext.toString("base64"),
  cipherAlgorithm: "AES-256-GCM",
  cipherNonce: cipherNonce.toString("base64"),
  wrappedBundleKey: wrappedBundleKey.toString("base64"),
  wrapAlgorithm: "AES-256-GCM",
  kdfAlgorithm: "scrypt",
  kdfSalt: kdfSalt.toString("base64"),
  kdfParams,
  manifest,
  bundleHash,
};

console.log("Manifest:", JSON.stringify(manifest, null, 2));
console.log(`Ciphertext size: ${(ciphertext.length / 1024).toFixed(1)} KB`);

// ─── Upload ───

const url = `${baseUrl}/api/v1/engrams/${engramId}/memory`;
console.log(`\nUploading to ${url} ...`);

const res = await fetch(url, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
});

const body = await res.json();

if (res.ok) {
  console.log("Upload successful:", JSON.stringify(body, null, 2));
} else {
  console.error(`Upload failed (${res.status}):`, JSON.stringify(body, null, 2));
  process.exit(1);
}
