#!/usr/bin/env node
/**
 * Compute the Mikoshi memory content hash from a local Engram directory.
 *
 * Usage:
 *   node scripts/hash-memory.mjs \
 *     --engram-dir ~/.relic/engrams/rebel \
 *     [--show-payload]
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MEMORY_HASH_VERSION = "mikoshi.memory.v1";

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function normalizeMemoryText(content) {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function buildMemoryCanonicalPayload(files) {
  const entries = Object.entries(files)
    .filter(([path]) => path === "USER.md" || path === "MEMORY.md" || path.startsWith("memory/"))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([path, content]) => {
      const normalized = normalizeMemoryText(content);
      return [path, String(Buffer.byteLength(normalized, "utf8")), normalized];
    })
    .flat();

  if (entries.length === 0) return null;

  return [MEMORY_HASH_VERSION, ...entries].join("\n");
}

const engramDir = arg("engram-dir");
const showPayload = hasFlag("show-payload");

if (!engramDir) {
  console.error("Usage: node scripts/hash-memory.mjs --engram-dir <dir> [--show-payload]");
  process.exit(1);
}

const files = {};

for (const filename of ["USER.md", "MEMORY.md"]) {
  const path = join(engramDir, filename);
  if (existsSync(path)) {
    files[filename] = readFileSync(path, "utf8");
  }
}

const memoryDir = join(engramDir, "memory");
if (existsSync(memoryDir)) {
  for (const name of readdirSync(memoryDir).sort()) {
    if (name.endsWith(".md")) {
      files[`memory/${name}`] = readFileSync(join(memoryDir, name), "utf8");
    }
  }
}

const canonicalPayload = buildMemoryCanonicalPayload(files);
if (canonicalPayload === null) {
  console.error("No in-scope memory files found in", engramDir);
  process.exit(1);
}

const hash = `sha256:${createHash("sha256").update(canonicalPayload, "utf8").digest("hex")}`;
const result = {
  version: MEMORY_HASH_VERSION,
  engramDir,
  files: Object.keys(files).sort(),
  hash,
};

if (showPayload) {
  result.canonicalPayload = canonicalPayload;
}

console.log(JSON.stringify(result, null, 2));
