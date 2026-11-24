const APPDEPLOY_ORIGIN = 'https://vyra-3t9rsu.v2.appdeploy.ai';

type ApiResult<T = any> = { data: T };

async function request<T = any>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Request failed. Please try again.');
  }
  return { data };
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T = any>(path: string, body: unknown) => request<T>('PUT', path, body),
};

// Owner authentication remains on the original AppDeploy storefront, where
// its managed sign-in session and owner role are configured.
export const auth = {
  getUser: async () => null as { email?: string; name?: string } | null,
  signInWithRedirect: async () => { window.location.assign(APPDEPLOY_ORIGIN + '/#admin'); },
  signOut: async () => undefined,
};
