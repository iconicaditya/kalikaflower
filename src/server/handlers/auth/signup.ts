import bcrypt from 'bcryptjs';
import { buildSessionCookie } from '@/server/lib/auth';
import { sql } from '@/server/lib/db';
import { fail, ok, readJson } from '@/server/lib/http';

type SignupBody = {
  fullName?: string;
  email?: string;
  password?: string;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return fail('Method not allowed', 405);
  }

  try {
    const body = await readJson<SignupBody>(request);
    const fullName = body.fullName?.trim() ?? '';
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!fullName || !email || !password) {
      return fail('Full name, email and password are required', 400);
    }
    if (password.length < 8) {
      return fail('Password must be at least 8 characters', 400);
    }

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? null;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    const existing = await sql<{ id: string }[]>`
      select id from users where lower(handle) = ${email} limit 1
    `;
    if (existing.length) {
      return fail('An account already exists with this email', 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const inserted = await sql<
      Array<{ id: string; handle: string; full_name: string | null; roles: string[]; first_name: string | null; last_name: string | null; avatar_url: string | null }>
    >`
      insert into users (handle, password_hash, full_name, first_name, last_name, roles)
      values (${email}, ${hash}, ${fullName}, ${firstName}, ${lastName}, ${[]})
      returning id, handle, full_name, roles, first_name, last_name, avatar_url
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

