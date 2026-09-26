// Every request to the PHP API goes through apiRequest(), so timeouts, JSON
// parsing and error messages are handled the same way everywhere.

// Expo copies EXPO_PUBLIC_* values into the app when it is bundled/built. They
// must be read with this exact `process.env.NAME` form, or they won't be found.
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

// Some shared hosts block PATCH/DELETE. When this is 'true', those requests are
// sent as POST with an X-HTTP-Method-Override header, which the API understands.
const USE_METHOD_OVERRIDE = process.env.EXPO_PUBLIC_API_METHOD_OVERRIDE === 'true';

const DEFAULT_TIMEOUT_MS = 15000;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  timeoutMs?: number;
}

// The shape every API response has: { success, data, message }.
interface ApiEnvelope {
  success: boolean;
  data: unknown;
  message: string;
}

export class ApiError extends Error {
  // HTTP status code, or null when the server was never reached.
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Something went wrong.';
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { success?: unknown }).success === 'boolean'
  );
}

function parseResponse<T>(status: number, ok: boolean, text: string): T {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  if (!isApiEnvelope(parsed)) {
    // Usually an HTML error page from the host or a wrong API URL.
    if (__DEV__) {
      console.warn(`[api] Non-JSON response (HTTP ${status}):`, text.slice(0, 300));
    }
    throw new ApiError(`The server sent an unexpected response (HTTP ${status}).`, status);
  }

  if (!ok || !parsed.success) {
    throw new ApiError(parsed.message || `Request failed (HTTP ${status}).`, status);
  }

  // The PHP API guarantees the data shape for each endpoint (see backend/api).
  return parsed.data as T;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new ApiError('The API address is missing. Set EXPO_PUBLIC_API_URL in .env.', null);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  let httpMethod: string = method;
  if (USE_METHOD_OVERRIDE && (method === 'PATCH' || method === 'DELETE')) {
    headers['X-HTTP-Method-Override'] = method;
    httpMethod = 'POST';
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetchText(
    `${API_URL}/${path}`,
    {
      method: httpMethod,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    timeoutMs
  );
  return parseResponse<T>(response.status, response.ok, response.text);
}

/**
 * fetch() plus a timeout and friendly network errors. Returns the raw body text;
 * callers parse it. Used for both our own API and third-party APIs.
 */
export async function fetchText(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<{ status: number; ok: boolean; text: string }> {
  // fetch() has no timeout of its own, so abort it ourselves if the server hangs.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    return { status: response.status, ok: response.ok, text };
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('The server took too long to respond. Please try again.', null);
    }
    throw new ApiError("Can't reach the server. Check your internet connection.", null);
  } finally {
    clearTimeout(timer);
  }
}
