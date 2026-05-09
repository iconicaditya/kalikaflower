import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { requirePost } from './_lib';

type Row = {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatar_seed: string;
  featured: boolean;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);

    const rows = await sql<Row[]>`
      select id, name, location, quote, rating, avatar_seed, featured
      from testimonials
      order by created_at desc
      limit 12
    `;

    return ok(
      rows.map((t) => ({
        _id: t.id,
        name: t.name,
        location: t.location,
        quote: t.quote,
        rating: t.rating,
        avatarSeed: t.avatar_seed,
        featured: t.featured,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list testimonials', 500);
  }
}


