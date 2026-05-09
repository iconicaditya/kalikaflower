import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { num, parseBody, requireAdminRequest } from './_lib';

type Body = { id?: string };

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
    const id = body.id?.trim();
    if (!id) return fail('id is required', 400);

    const rows = await sql<OrderRow[]>`
      select id, order_number, email, full_name, phone, address, city, notes,
             items, subtotal, shipping, total, status, created_at
      from orders
      where id = ${id}
      limit 1
    `;

    const o = rows[0];
    if (!o) return fail('Order not found', 404);

    return ok({
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
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to get order', 500);
  }
}


