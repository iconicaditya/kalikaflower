import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requirePost } from './_lib';

type Body = { sessionId?: string };

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const sessionId = body.sessionId?.trim();
    if (!sessionId) return fail('sessionId is required', 400);

    await sql`
      update carts
      set items = '[]'::jsonb,
          updated_at = now()
      where session_id = ${sessionId}
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to clear cart', 500);
  }
}


