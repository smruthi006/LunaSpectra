import type { z } from 'zod';
import { getApiBaseUrl } from './endpoints';
import { ApiErrorResponseSchema } from './schemas';

export type ApiErrorKind =
  'network_offline' | 'timeout' | 'http_error' | 'validation_error' | 'invalid_json';

export class ApiClientError extends Error {
  public readonly kind: ApiErrorKind;
  public readonly status?: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(options: {
    kind: ApiErrorKind;
    message: string;
    code: string;
    status?: number;
    details?: unknown;
  }) {
    super(options.message);
    this.name = 'ApiClientError';
    this.kind = options.kind;
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

export interface ApiFetchOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ApiFetchOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 12000;
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  const forwardAbort = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', forwardAbort, { once: true });
    }
  }

  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    globalThis.clearTimeout(timeoutId);
    if (options.signal) {
      options.signal.removeEventListener('abort', forwardAbort);
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiClientError({
        kind: 'timeout',
        code: 'REQUEST_TIMEOUT',
        message: `Request to ${path} timed out after ${timeoutMs} ms.`,
      });
    }
    throw new ApiClientError({
      kind: 'network_offline',
      code: 'BACKEND_OFFLINE',
      message:
        'Unable to reach the LunaSpectra FastAPI backend. Confirm the server is running and CORS allows this origin.',
      details: err instanceof Error ? err.message : String(err),
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
    if (options.signal) {
      options.signal.removeEventListener('abort', forwardAbort);
    }
  }

  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch (err) {
    throw new ApiClientError({
      kind: 'invalid_json',
      code: 'INVALID_JSON',
      status: response.status,
      message: `Backend returned non-JSON payload (HTTP ${response.status}).`,
      details: err instanceof Error ? err.message : String(err),
    });
  }

  if (!response.ok) {
    const parsedErr = ApiErrorResponseSchema.safeParse(rawJson);
    if (parsedErr.success) {
      throw new ApiClientError({
        kind: 'http_error',
        status: response.status,
        code: parsedErr.data.error.code,
        message: parsedErr.data.error.message,
        details: parsedErr.data.error.details,
      });
    }
    throw new ApiClientError({
      kind: 'http_error',
      status: response.status,
      code: `HTTP_${response.status}`,
      message: `Backend request failed with HTTP ${response.status}.`,
      details: rawJson,
    });
  }

  const parsed = schema.safeParse(rawJson);
  if (!parsed.success) {
    throw new ApiClientError({
      kind: 'validation_error',
      code: 'SCHEMA_VALIDATION_FAILED',
      status: response.status,
      message: `Response from ${path} did not match the verified API contract.`,
      details: parsed.error.issues,
    });
  }

  return parsed.data;
}

export function isApiClientError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError;
}
