#!/usr/bin/env node
/**
 * Fetch Mikoshi sync-status and compare it against local tokens.
 *
 * Usage:
 *   node scripts/check-sync-status.mjs \
 *     --engram-id eng_XXXX \
 *     --api-key YOUR_API_KEY \
 *     [--persona-hash sha256:...] \
 *     [--memory-content-hash sha256:...] \
 *     [--base-url http://localhost:3000]
 */

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

const engramId = arg("engram-id");
const apiKey = arg("api-key");
const personaHash = arg("persona-hash") ?? null;
const memoryContentHash = arg("memory-content-hash") ?? null;
const baseUrl = arg("base-url") ?? "http://localhost:3000";

if (!engramId || !apiKey) {
  console.error("Usage: node scripts/check-sync-status.mjs --engram-id <id> --api-key <key> [--persona-hash sha256:...] [--memory-content-hash sha256:...] [--base-url http://localhost:3000]");
  process.exit(1);
}

const url = new URL(`/api/v1/engrams/${engramId}/sync-status`, baseUrl).toString();

const response = await fetch(url, {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
});

const remote = await response.json();

if (!response.ok) {
  console.error(`Request failed (${response.status}):`, JSON.stringify(remote, null, 2));
  process.exit(1);
}

function compareToken(localToken, remoteToken) {
  if (localToken === null) return "local_unavailable";
  if (remoteToken === null) return "remote_unavailable";
  return localToken === remoteToken ? "match" : "different";
}

function classifyOverall(personaState, memoryState) {
  const states = [personaState, memoryState];
  if (states.includes("local_unavailable") || states.includes("remote_unavailable")) {
    return "incomplete";
  }
  if (personaState === "different" && memoryState === "different") return "mixed";
  if (personaState === "different") return "persona";
  if (memoryState === "different") return "memory";
  return "clean";
}

const personaState = compareToken(personaHash, remote.persona?.token?.hash ?? null);
const memoryState = compareToken(
  memoryContentHash,
  remote.memory?.token?.memoryContentHash ?? null
);

const comparison = {
  engramId: remote.engramId,
  overall: classifyOverall(personaState, memoryState),
  persona: {
    state: personaState,
    localToken: personaHash,
    remoteToken: remote.persona?.token?.hash ?? null,
  },
  memory: {
    state: memoryState,
    localToken: memoryContentHash,
    remoteToken: remote.memory?.token?.memoryContentHash ?? null,
  },
};

console.log(JSON.stringify({ remote, comparison }, null, 2));
