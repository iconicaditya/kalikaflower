import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requireAdminRequest } from './_lib';

type Body = {
  id?: string;
  name?: string;
  location?: string;
  quote?: string;
  rating?: number;
  avatarSeed?: string;
  featured?: boolean;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const id = body.id?.trim();
    const name = body.name?.trim();
    const location = body.location?.trim();
    const quote = body.quote?.trim();
    const avatarSeed = body.avatarSeed?.trim();
    const rating = Number(body.rating ?? 0);
    const featured = Boolean(body.featured);

    if (!name || !location || !quote || !avatarSeed) {
      return fail('name, location, quote, and avatarSeed are required', 400);
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return fail('rating must be between 1 and 5', 400);
    }

    if (id) {
      const updated = await sql<Array<{ id: string }>>`
        update testimonials
        set name = ${name},
            location = ${location},
            quote = ${quote},
            rating = ${rating},
            avatar_seed = ${avatarSeed},
            featured = ${featured}
        where id = ${id}
        returning id
      `;
      if (!updated[0]) return fail('Testimonial not found', 404);
      return ok({ ok: true });
    }

    await sql`
      insert into testimonials (name, location, quote, rating, avatar_seed, featured, created_at)
      values (${name}, ${location}, ${quote}, ${rating}, ${avatarSeed}, ${featured}, now())
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to save testimonial', 500);
  }
}


