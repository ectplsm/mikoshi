import type {
  EngramSyncStatusResponseType,
  OverallDriftClassType,
  SyncComparisonStateType,
} from "@/lib/schemas/engram";

export type LocalSyncSnapshot = {
  personaHash: string | null;
  memoryContentHash: string | null;
};

export type SyncDomainComparison = {
  state: SyncComparisonStateType;
  localToken: string | null;
  remoteToken: string | null;
};

export type SyncComparisonResult = {
  engramId: string;
  overall: OverallDriftClassType;
  persona: SyncDomainComparison;
  memory: SyncDomainComparison;
};

function compareToken(
  localToken: string | null,
  remoteToken: string | null
): SyncComparisonStateType {
  if (localToken === null) return "local_unavailable";
  if (remoteToken === null) return "remote_unavailable";
  return localToken === remoteToken ? "match" : "different";
}

function classifyOverall(
  personaState: SyncComparisonStateType,
  memoryState: SyncComparisonStateType
): OverallDriftClassType {
  const states = [personaState, memoryState];

  if (states.includes("local_unavailable") || states.includes("remote_unavailable")) {
    return "incomplete";
  }

  const personaDiffers = personaState === "different";
  const memoryDiffers = memoryState === "different";

  if (personaDiffers && memoryDiffers) return "mixed";
  if (personaDiffers) return "persona";
  if (memoryDiffers) return "memory";
  return "clean";
}

export function compareSyncStatus(
  remote: EngramSyncStatusResponseType,
  local: LocalSyncSnapshot
): SyncComparisonResult {
  const personaRemoteToken = remote.persona.token?.hash ?? null;
  const memoryRemoteToken = remote.memory.token?.memoryContentHash ?? null;

  const personaState = compareToken(local.personaHash, personaRemoteToken);
  const memoryState = compareToken(local.memoryContentHash, memoryRemoteToken);

  return {
    engramId: remote.engramId,
    overall: classifyOverall(personaState, memoryState),
    persona: {
      state: personaState,
      localToken: local.personaHash,
      remoteToken: personaRemoteToken,
    },
    memory: {
      state: memoryState,
      localToken: local.memoryContentHash,
      remoteToken: memoryRemoteToken,
    },
  };
}
