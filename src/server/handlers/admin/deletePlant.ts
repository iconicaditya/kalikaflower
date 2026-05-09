import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requireAdminRequest } from './_lib';

type Body = { id?: string };

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);
    const id = body.id?.trim();
    if (!id) return fail('id is required', 400);

    const deleted = await sql<Array<{ id: string }>>`
      delete from plants
      where id = ${id}
      returning id
    `;

    if (!deleted[0]) return fail('Plant not found', 404);
    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to delete plant', 500);
  }
}


