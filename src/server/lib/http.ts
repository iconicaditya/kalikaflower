export function ok<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

export function fail(message: string, status = 400, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

