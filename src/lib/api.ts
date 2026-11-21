const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return rawBaseUrl ? `${rawBaseUrl}${normalizedPath}` : normalizedPath;
}

async function fetchJsonStrict<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('API returned non-JSON response');
  }

  return (await response.json()) as T;
}

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = getApiUrl(normalizedPath);

  try {
    return await fetchJsonStrict<T>(targetUrl, init);
  } catch (err) {
    // If VITE_API_BASE_URL fails due to CORS/network/misconfiguration, try same-origin /api/*
    if (rawBaseUrl && targetUrl !== normalizedPath) {
      return await fetchJsonStrict<T>(normalizedPath, init);
    }
    throw err;
  }
}

export async function fetchApiJsonWithFallback<T>(
  path: string,
  fallback: T,
  init?: RequestInit
): Promise<{ data: T; fromFallback: boolean }> {
  try {
    const data = await fetchApiJson<T>(path, init);
    return { data, fromFallback: false };
  } catch {
    return { data: fallback, fromFallback: true };
  }
}
