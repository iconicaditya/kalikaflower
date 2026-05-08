import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { requireAdminRequest } from './_lib';

type Row = {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatar_seed: string;
  featured: boolean;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);

    const rows = await sql<Row[]>`
      select id, name, location, quote, rating, avatar_seed, featured, created_at
      from testimonials
      order by created_at desc
      limit 100
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
        createdAt: t.created_at,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list testimonials', 500);
  }
}

