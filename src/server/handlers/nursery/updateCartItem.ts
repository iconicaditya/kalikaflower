import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requirePost } from './_lib';

type Body = {
  sessionId?: string;
  slug?: string;
  quantity?: number;
};

type CartItem = {
  plantId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const sessionId = body.sessionId?.trim();
    const slug = body.slug?.trim();
    const quantity = Math.max(0, Math.min(body.quantity ?? 0, 50));

    if (!sessionId || !slug) return fail('sessionId and slug are required', 400);

    const carts = await sql<Array<{ id: string; items: CartItem[] }>>`
      select id, items
      from carts
      where session_id = ${sessionId}
      limit 1
    `;

    const cart = carts[0];
    if (!cart) return ok({ ok: true });

    let items = [...(cart.items ?? [])];
    if (quantity === 0) {
      items = items.filter((i) => i.slug !== slug);
    } else {
      const idx = items.findIndex((i) => i.slug === slug);
      if (idx >= 0) items[idx] = { ...items[idx], quantity };
    }

    await sql`
      update carts
      set items = ${JSON.stringify(items)}::jsonb,
          updated_at = now()
      where id = ${cart.id}
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to update cart item', 500);
  }
}


