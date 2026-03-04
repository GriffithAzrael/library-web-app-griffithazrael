export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Request failed', res.status);
  }

  // kalau API punya `success: false` tapi status 200, handle juga:
  if (
    json &&
    typeof json === 'object' &&
    'success' in json &&
    json.success === false
  ) {
    throw new ApiError(json.message ?? 'Request failed', res.status);
  }

  return json as T;
}
