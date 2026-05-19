export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(status: number, message: string, details: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

interface ApiErrorEnvelope {
  success?: false;
  error?: { code?: string; message?: string; details?: unknown };
  errors?: unknown;
  message?: string;
}

type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope | T | null;

function hasDataField<T>(payload: unknown): payload is ApiSuccessEnvelope<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    (payload as { success?: boolean }).success !== false
  );
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);

  let payload: ApiEnvelope<T> = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errEnv = (payload ?? {}) as ApiErrorEnvelope;
    const message =
      errEnv?.error?.message || errEnv?.message || 'Une erreur est survenue.';
    const details = errEnv?.error?.details ?? errEnv?.errors ?? null;
    throw new ApiError(response.status, message, details);
  }

  if (hasDataField<T>(payload)) {
    return payload.data;
  }

  return payload as T;
}
