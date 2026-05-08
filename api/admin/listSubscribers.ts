import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { requireAdminRequest } from './_lib';

type Row = {
  id: string;
  email: string;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);

    const rows = await sql<Row[]>`
      select id, email, created_at
      from newsletter_subscribers
      order by created_at desc
      limit 500
    `;

    return ok(
      rows.map((s) => ({
        _id: s.id,
        email: s.email,
        createdAt: s.created_at,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list subscribers', 500);
  }
}

