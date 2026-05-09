import { fail, ok } from '../../lib/http';
import { getCartWithPlants, num, parseBody, requirePost } from './_lib';

type Body = { sessionId?: string };

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const sessionId = body.sessionId?.trim();
    if (!sessionId) return fail('sessionId is required', 400);

    const cart = await getCartWithPlants(sessionId);
    if (!cart) return ok({ sessionId, items: [], subtotal: 0 });

    const items = cart.items
      .map((i) => {
        const p = cart.plantMap.get(i.slug);
        if (!p) return null;
        const lineTotal = num(p.price) * i.quantity;
        return {
          slug: p.slug,
          name: p.name,
          price: num(p.price),
          image: p.images?.[0] ?? '',
          quantity: i.quantity,
          lineTotal,
        };
      })
      .filter(Boolean) as Array<{
      slug: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
      lineTotal: number;
    }>;

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return ok({ sessionId, items, subtotal });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to fetch cart', 500);
  }
}


