const TOKEN_KEY = 'token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, body.error ?? 'Unknown error');
  }

  return response.json() as Promise<T>;
}
