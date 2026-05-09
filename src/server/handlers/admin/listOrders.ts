import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { num, parseBody, requireAdminRequest } from './_lib';

type Body = {
  status?: string;
  search?: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  items: unknown[];
  subtotal: string | number;
  shipping: string | number;
  total: string | number;
  status: string;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const filters: string[] = [];
    const values: string[] = [];
    let i = 1;

    if (body.status && body.status !== 'all') {
      filters.push(`status = $${i++}`);
      values.push(body.status);
    }
    if (body.search?.trim()) {
      filters.push(`(order_number ilike $${i} or email ilike $${i} or full_name ilike $${i})`);
      values.push(`%${body.search.trim()}%`);
      i += 1;
    }

    const where = filters.length ? `where ${filters.join(' and ')}` : '';
    const query = `
      select id, order_number, email, full_name, phone, address, city, notes,
             items, subtotal, shipping, total, status, created_at
      from orders
      ${where}
      order by created_at desc
      limit 200
    `;

    const rows = await sql.unsafe<OrderRow[]>(query, values);

    return ok(
      rows.map((o) => ({
        _id: o.id,
        orderNumber: o.order_number,
        email: o.email,
        fullName: o.full_name,
        phone: o.phone,
        address: o.address,
        city: o.city,
        notes: o.notes ?? '',
        items: Array.isArray(o.items) ? o.items : [],
        subtotal: num(o.subtotal),
        shipping: num(o.shipping),
        total: num(o.total),
        status: o.status,
        createdAt: o.created_at,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list orders', 500);
  }
}


