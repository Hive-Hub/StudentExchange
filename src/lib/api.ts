const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return rawBaseUrl ? `${rawBaseUrl}${normalizedPath}` : normalizedPath;
}

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), init);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('API returned non-JSON response');
  }

  return (await response.json()) as T;
}
