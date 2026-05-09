import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requireAdminRequest } from './_lib';

type Body = {
  id?: string;
  status?: string;
};

const ALLOWED = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);
    const id = body.id?.trim();
    const status = body.status?.trim();

    if (!id || !status) return fail('id and status are required', 400);
    if (!ALLOWED.has(status)) return fail('Invalid status', 400);

    const updated = await sql<Array<{ id: string }>>`
      update orders
      set status = ${status}
      where id = ${id}
      returning id
    `;

    if (!updated[0]) return fail('Order not found', 404);
    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to update order status', 500);
  }
}


