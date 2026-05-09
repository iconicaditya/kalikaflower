import { createHmac, timingSafeEqual } from 'node:crypto';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import { isProd, requireSessionSecret } from './env';
import { sql } from './db';

const SESSION_COOKIE = 'gph_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

type SessionPayload = {
  uid: string;
  exp: number;
};

function b64(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64url');
}

function fromB64(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf8');
}

function sign(value: string): string {
  return createHmac('sha256', requireSessionSecret()).update(value).digest('base64url');
}

function encode(payload: SessionPayload): string {
  const body = b64(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

function decode(token: string): SessionPayload | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const payload = JSON.parse(fromB64(body)) as SessionPayload;
  if (!payload?.uid || !payload?.exp || payload.exp < Date.now()) return null;
  return payload;
}

export function buildSessionCookie(userId: string): string {
  const token = encode({ uid: userId, exp: Date.now() + MAX_AGE_SEC * 1000 });
  return serializeCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: MAX_AGE_SEC,
  });
}

export function clearSessionCookie(): string {
  return serializeCookie(SESSION_COOKIE, '', {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function getSessionUser(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = parseCookie(cookieHeader);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const payload = decode(token);
  if (!payload) return null;

  const rows = await sql<
    Array<{
      id: string;
      handle: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      roles: string[];
    }>
  >`
    select id, handle, first_name, last_name, avatar_url, roles
    from users
    where id = ${payload.uid}
    limit 1
  `;

  const user = rows[0];
  if (!user) return null;

  return {
    id: user.id,
    handle: user.handle,
    firstName: user.first_name ?? undefined,
    lastName: user.last_name ?? undefined,
    avatarUrl: user.avatar_url ?? undefined,
    roles: user.roles ?? [],
  };
}

export function requireUser<T>(user: T | null): asserts user is T {
  if (!user) throw new Error('Not authenticated');
}

export function requireAdmin(user: { roles?: string[] } | null): asserts user is { roles: string[] } {
  if (!user) throw new Error('Not authenticated');
  if (!(user.roles ?? []).includes('admin')) throw new Error('Admin access required');
}

