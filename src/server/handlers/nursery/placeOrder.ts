import { getSessionUser } from '../../lib/auth';
import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { getCartWithPlants, num, orderNumber, parseBody, requirePost } from './_lib';

type Body = {
  sessionId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const user = await getSessionUser(request);
    const body = await parseBody<Body>(request);

    const sessionId = body.sessionId?.trim();
    const email = body.email?.trim();
    const fullName = body.fullName?.trim();
    const phone = body.phone?.trim();
    const address = body.address?.trim();
    const city = body.city?.trim();
    const notes = body.notes?.trim() || null;

    if (!sessionId || !email || !fullName || !phone || !address || !city) {
      return fail('Missing required checkout fields', 400);
    }

    const cart = await getCartWithPlants(sessionId);
    if (!cart || cart.items.length === 0) return fail('Your cart is empty', 400);

    const items = cart.items
      .map((i) => {
        const p = cart.plantMap.get(i.slug);
        if (!p) return null;
        return {
          plantId: p.id,
          slug: p.slug,
          name: p.name,
          price: num(p.price),
          image: p.images?.[0] ?? '',
          quantity: i.quantity,
        };
      })
      .filter(Boolean) as Array<{
      plantId: string;
      slug: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
    }>;

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 250;
    const total = subtotal + shipping;
    const ord = orderNumber();

    await sql`
      insert into orders (
        order_number, user_id, email, full_name, phone, address, city, notes,
        items, subtotal, shipping, total, status, created_at
      ) values (
        ${ord}, ${user?.id ?? null}, ${email}, ${fullName}, ${phone}, ${address}, ${city}, ${notes},
        ${JSON.stringify(items)}::jsonb, ${subtotal}, ${shipping}, ${total}, 'pending', now()
      )
    `;

    await sql`
      update carts
      set items = '[]'::jsonb,
          updated_at = now()
      where id = ${cart.cartId}
    `;

    return ok({ orderNumber: ord, total });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to place order', 500);
  }
}


