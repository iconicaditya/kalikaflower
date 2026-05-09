import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requirePost } from './_lib';

type Body = { email?: string };

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const email = body.email?.trim().toLowerCase();
    if (!email) return fail('email is required', 400);

    await sql`
      insert into newsletter_subscribers (email, created_at)
      values (${email}, now())
      on conflict (email) do nothing
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to subscribe', 500);
  }
}


