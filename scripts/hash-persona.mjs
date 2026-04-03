#!/usr/bin/env node
/**
 * Compute the Mikoshi persona hash from a local Engram directory.
 *
 * Usage:
 *   node scripts/hash-persona.mjs \
 *     --engram-dir ~/.relic/engrams/rebel \
 *     [--show-payload]
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PERSONA_HASH_VERSION = "mikoshi.persona.v1";

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function normalizePersonaText(content) {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n+$/g, "");
}

function buildPersonaCanonicalPayload(soulContent, identityContent) {
  const normalizedSoul = normalizePersonaText(soulContent);
  const normalizedIdentity = normalizePersonaText(identityContent);

  return [
    PERSONA_HASH_VERSION,
    "SOUL.md",
    String(Buffer.byteLength(normalizedSoul, "utf8")),
    normalizedSoul,
    "IDENTITY.md",
    String(Buffer.byteLength(normalizedIdentity, "utf8")),
    normalizedIdentity,
  ].join("\n");
}

const engramDir = arg("engram-dir");
const showPayload = hasFlag("show-payload");

if (!engramDir) {
  console.error("Usage: node scripts/hash-persona.mjs --engram-dir <dir> [--show-payload]");
  process.exit(1);
}

const soulPath = join(engramDir, "SOUL.md");
const identityPath = join(engramDir, "IDENTITY.md");

if (!existsSync(soulPath) || !existsSync(identityPath)) {
  console.error("SOUL.md and IDENTITY.md are both required in", engramDir);
  process.exit(1);
}

const soul = readFileSync(soulPath, "utf8");
const identity = readFileSync(identityPath, "utf8");
const canonicalPayload = buildPersonaCanonicalPayload(soul, identity);
const hash = `sha256:${createHash("sha256").update(canonicalPayload, "utf8").digest("hex")}`;

const result = {
  version: PERSONA_HASH_VERSION,
  engramDir,
  hash,
};

if (showPayload) {
  result.canonicalPayload = canonicalPayload;
}

console.log(JSON.stringify(result, null, 2));
