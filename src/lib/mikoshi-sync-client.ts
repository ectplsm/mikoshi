import {
  EngramSyncStatusResponse,
  type EngramSyncStatusResponseType,
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
  details?: unknown;
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
      errorBody.details
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
