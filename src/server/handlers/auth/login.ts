import bcrypt from 'bcryptjs';
import { buildSessionCookie } from '../../lib/auth';
import { sql } from '../../lib/db';
import { fail, ok, readJson } from '../../lib/http';

type LoginBody = {
  email?: string;
  password?: string;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return fail('Method not allowed', 405);
  }

  try {
    const body = await readJson<LoginBody>(request);
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!email || !password) {
      return fail('Email and password are required', 400);
    }

    const rows = await sql<
      Array<{
        id: string;
        handle: string;
        password_hash: string;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        roles: string[];
      }>
    >`
      select id, handle, password_hash, first_name, last_name, avatar_url, roles
      from users
      where lower(handle) = ${email}
      limit 1
    `;

    const user = rows[0];
    if (!user) return fail('Invalid email or password', 401);

    const passOk = await bcrypt.compare(password, user.password_hash);
    if (!passOk) return fail('Invalid email or password', 401);

    return ok(
      {
        ok: true,
        user: {
          id: user.id,
          handle: user.handle,
          firstName: user.first_name ?? undefined,
          lastName: user.last_name ?? undefined,
          avatarUrl: user.avatar_url ?? undefined,
          roles: user.roles ?? [],
        },
      },
      {
        headers: {
          'set-cookie': buildSessionCookie(user.id),
        },
      }
    );
  } catch (error) {
    return fail((error as Error).message || 'Unable to login', 500);
  }
}


