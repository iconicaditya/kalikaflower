import { getSessionUser } from '../../lib/auth';
import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requirePost } from './_lib';

type Body = {
  sessionId?: string;
  slug?: string;
  quantity?: number;
};

type PlantLite = {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  images: string[];
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
    const user = await getSessionUser(request);
    const body = await parseBody<Body>(request);
    const sessionId = body.sessionId?.trim();
    const slug = body.slug?.trim();
    const quantity = Math.max(1, Math.min(body.quantity ?? 1, 50));

    if (!sessionId || !slug) {
      return fail('sessionId and slug are required', 400);
    }

    const plants = await sql<PlantLite[]>`
      select id, slug, name, price, images
      from plants
      where slug = ${slug}
      limit 1
    `;

    const plant = plants[0];
    if (!plant) return fail('Plant not found', 404);

    const newItem: CartItem = {
      plantId: plant.id,
      slug: plant.slug,
      name: plant.name,
      price: Number(plant.price),
      image: plant.images?.[0] ?? '',
      quantity,
    };

    const carts = await sql<Array<{ id: string; items: CartItem[] }>>`
      select id, items
      from carts
      where session_id = ${sessionId}
      limit 1
    `;

    const existing = carts[0];

    if (!existing) {
      await sql`
        insert into carts (session_id, user_id, items, updated_at)
        values (${sessionId}, ${user?.id ?? null}, ${JSON.stringify([newItem])}::jsonb, now())
      `;
    } else {
      const items = [...(existing.items ?? [])];
      const idx = items.findIndex((i) => i.slug === slug);
      if (idx >= 0) {
        items[idx] = { ...newItem, quantity: items[idx].quantity + quantity };
      } else {
        items.push(newItem);
      }

      await sql`
        update carts
        set user_id = coalesce(user_id, ${user?.id ?? null}),
            items = ${JSON.stringify(items)}::jsonb,
            updated_at = now()
        where id = ${existing.id}
      `;
    }

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to add to cart', 500);
  }
}


