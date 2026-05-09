import type { IncomingMessage, ServerResponse } from 'node:http';

type NodeRequest = IncomingMessage & { body?: unknown };
type WebHandler = (request: Request) => Promise<Response>;

function getRequestCtor(): typeof Request {
  if (!globalThis.Request) {
    throw new Error('Request API is not available in this runtime');
  }

  return globalThis.Request;
}

function toWebRequest(req: NodeRequest): Request {
  const protocolHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protocolHeader) ? protocolHeader[0] : protocolHeader;
  const hostHeader = req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const method = (req.method ?? 'GET').toUpperCase();
  const url = `${protocol ?? 'https'}://${host ?? 'localhost'}${req.url ?? '/'}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (req.body instanceof Uint8Array) {
      body = req.body as unknown as BodyInit;
    } else if (req.body != null) {
      body = JSON.stringify(req.body);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }
    }
  }

  const RequestCtor = getRequestCtor();
  return new RequestCtor(url, { method, headers, body });
}

async function writeWebResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const payload = Buffer.from(await response.arrayBuffer());
  res.end(payload);
}

export async function runWebHandler(req: NodeRequest, res: ServerResponse, handler: WebHandler) {
  try {
    const webRequest = toWebRequest(req);
    const webResponse = await handler(webRequest);
    await writeWebResponse(res, webResponse);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        error: (error as Error).message || 'Internal server error',
      }),
    );
  }
}

