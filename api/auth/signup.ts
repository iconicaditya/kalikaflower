import bcrypt from 'bcryptjs';
import { buildSessionCookie } from '@/server/lib/auth';
import { sql } from '@/server/lib/db';
import { fail, ok, readJson } from '@/server/lib/http';

type SignupBody = {
  email?: string;
  password?: string;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return fail('Method not allowed', 405);
  }

  try {
    const body = await readJson<SignupBody>(request);
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!email || !password) {
      return fail('Email and password are required', 400);
    }
    if (password.length < 8) {
      return fail('Password must be at least 8 characters', 400);
    }

    const existing = await sql<{ id: string }[]>`
      select id from users where lower(handle) = ${email} limit 1
    `;
    if (existing.length) {
      return fail('An account already exists with this email', 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const inserted = await sql<
      Array<{ id: string; handle: string; roles: string[]; first_name: string | null; last_name: string | null; avatar_url: string | null }>
    >`
      insert into users (handle, password_hash, roles)
      values (${email}, ${hash}, ${[]})
      returning id, handle, roles, first_name, last_name, avatar_url
    `;

    const user = inserted[0];
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
    return fail((error as Error).message || 'Unable to create account', 500);
  }
}

