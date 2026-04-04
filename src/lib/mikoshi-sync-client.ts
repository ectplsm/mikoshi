import {
  DeleteMemoryResponse,
  type DeleteMemoryResponseType,
  EngramSyncStatusResponse,
  type EngramSyncStatusResponseType,
  MemoryUploadResponse,
  type MemoryUploadResponseType,
  UpdatePersonaResponse,
  type UpdatePersonaResponseType,
} from "@/lib/schemas/engram";
import {
  compareSyncStatus,
  type LocalSyncSnapshot,
  type SyncComparisonResult,
} from "@/lib/sync-compare";

export type MikoshiSyncClientConfig = {
  baseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
};

type ApiErrorBody = {
  error?: string;
  code?: string;
  currentPersona?: {
    hash: string;
    updatedAt: string;
  };
  currentMemory?: {
    memoryContentHash: string;
    version: number;
    updatedAt: string;
  } | null;
  details?: unknown;
};

export type UpdatePersonaRequest = {
  soul: string;
  identity: string;
  expectedRemotePersonaHash: string;
};

export type UploadMemoryRequest = {
  ciphertext: string;
  cipherAlgorithm: string;
  cipherNonce: string;
  wrappedBundleKey: string;
  wrapAlgorithm: string;
  kdfAlgorithm: string;
  kdfSalt: string;
  kdfParams: {
    N: number;
    r: number;
    p: number;
    dkLen: number;
  };
  manifest: {
    payloadKind: "memory";
    bundleVersion: number;
    hasUserFile: boolean;
    hasMemoryIndex: boolean;
    memoryEntryCount: number;
    latestMemoryDate: string | null;
  };
  expectedRemoteMemoryContentHash: string | null;
  memoryContentHash: string;
  bundleHash: string;
};

export type DeleteMemoryRequest = {
  expectedRemoteMemoryContentHash: string;
};

export class MikoshiApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "MikoshiApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

async function parseJsonResponse(response: Response) {
  const body = (await response.json()) as unknown;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new MikoshiApiError(
      response.status,
      errorBody.error ?? `HTTP ${response.status}`,
      errorBody.details ?? body
    );
  }

  return body;
}

function getFetchImpl(fetchImpl?: typeof fetch) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is unavailable. Pass fetchImpl explicitly.");
  }
  return fetch;
}

export async function fetchSyncStatus(
  config: MikoshiSyncClientConfig,
  engramId: string
): Promise<EngramSyncStatusResponseType> {
  const fetchFn = getFetchImpl(config.fetchImpl);
  const response = await fetchFn(
    buildUrl(config.baseUrl, `/api/v1/engrams/${engramId}/sync-status`),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
    }
  );

  return EngramSyncStatusResponse.parse(await parseJsonResponse(response));
}

export async function fetchAndCompareSyncStatus(
  config: MikoshiSyncClientConfig,
  engramId: string,
  local: LocalSyncSnapshot
): Promise<SyncComparisonResult> {
  const remote = await fetchSyncStatus(config, engramId);
  return compareSyncStatus(remote, local);
}

export async function updatePersona(
  config: MikoshiSyncClientConfig,
  engramId: string,
  input: UpdatePersonaRequest
): Promise<UpdatePersonaResponseType> {
  const fetchFn = getFetchImpl(config.fetchImpl);
  const response = await fetchFn(
    buildUrl(config.baseUrl, `/api/v1/engrams/${engramId}/persona`),
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(input),
    }
  );

  return UpdatePersonaResponse.parse(await parseJsonResponse(response));
}

export async function uploadMemory(
  config: MikoshiSyncClientConfig,
  engramId: string,
  input: UploadMemoryRequest
): Promise<MemoryUploadResponseType> {
  const fetchFn = getFetchImpl(config.fetchImpl);
  const response = await fetchFn(
    buildUrl(config.baseUrl, `/api/v1/engrams/${engramId}/memory`),
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(input),
    }
  );

  return MemoryUploadResponse.parse(await parseJsonResponse(response));
}

export async function deleteMemory(
  config: MikoshiSyncClientConfig,
  engramId: string,
  input: DeleteMemoryRequest
): Promise<DeleteMemoryResponseType> {
  const fetchFn = getFetchImpl(config.fetchImpl);
  const response = await fetchFn(
    buildUrl(config.baseUrl, `/api/v1/engrams/${engramId}/memory`),
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(input),
    }
  );

  return DeleteMemoryResponse.parse(await parseJsonResponse(response));
}
