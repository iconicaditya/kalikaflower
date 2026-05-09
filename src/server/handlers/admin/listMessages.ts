import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { requireAdminRequest } from './_lib';

type Row = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);

    const rows = await sql<Row[]>`
      select id, name, email, subject, message, created_at
      from contact_messages
      order by created_at desc
      limit 200
    `;

    return ok(
      rows.map((m) => ({
        _id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        createdAt: m.created_at,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list messages', 500);
  }
}


