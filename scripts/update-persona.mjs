#!/usr/bin/env node
/**
 * Replace remote persona files with local SOUL.md and IDENTITY.md.
 *
 * Usage:
 *   node scripts/update-persona.mjs \
 *     --engram-dir ~/.relic/engrams/rebel \
 *     --engram-id eng_XXXX \
 *     --api-key YOUR_API_KEY \
 *     --expected-remote-persona-hash sha256:... \
 *     [--base-url http://localhost:3000]
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

const engramDir = arg("engram-dir");
const engramId = arg("engram-id");
const apiKey = arg("api-key");
const expectedRemotePersonaHash = arg("expected-remote-persona-hash");
const baseUrl = arg("base-url") ?? "http://localhost:3000";

if (!engramDir || !engramId || !apiKey || !expectedRemotePersonaHash) {
  console.error(
    "Usage: node scripts/update-persona.mjs --engram-dir <dir> --engram-id <id> --api-key <key> --expected-remote-persona-hash sha256:... [--base-url http://localhost:3000]"
  );
  process.exit(1);
}

const soul = readFileSync(join(engramDir, "SOUL.md"), "utf-8");
const identity = readFileSync(join(engramDir, "IDENTITY.md"), "utf-8");

const response = await fetch(`${baseUrl}/api/v1/engrams/${engramId}/persona`, {
  method: "PUT",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    soul,
    identity,
    expectedRemotePersonaHash,
  }),
});

const body = await response.json();

if (!response.ok) {
  console.error(`Persona update failed (${response.status}):`, JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));
