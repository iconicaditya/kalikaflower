import { getSessionUser } from '@/server/lib/auth';
import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { parseBody, requirePost } from './_lib';

type Body = {
  plantId?: string;
  authorName?: string;
  location?: string;
  rating?: number;
  title?: string;
  body?: string;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const user = await getSessionUser(request);
    const data = await parseBody<Body>(request);

    const plantId = data.plantId?.trim();
    const authorName = data.authorName?.trim();
    const location = data.location?.trim();
    const rating = Number(data.rating ?? 0);
    const title = data.title?.trim();
    const body = data.body?.trim();

    if (!plantId || !authorName || !location || !title || !body) {
      return fail('Missing required review fields', 400);
    }
    if (rating < 1 || rating > 5) return fail('Rating must be between 1 and 5', 400);

    await sql`
      insert into reviews (plant_id, user_id, author_name, location, rating, title, body, verified, created_at)
      values (
        ${plantId}, ${user?.id ?? null}, ${authorName}, ${location}, ${rating}, ${title}, ${body}, ${!!user}, now()
      )
    `;

    const agg = await sql<Array<{ avg_rating: string | null; review_count: string }>>`
      select avg(rating)::text as avg_rating, count(*)::text as review_count
      from reviews
      where plant_id = ${plantId}
    `;

    const avg = Number(agg[0]?.avg_rating ?? 0);
    const reviewCount = Number(agg[0]?.review_count ?? 0);

    await sql`
      update plants
      set rating = ${Math.round(avg * 10) / 10},
          review_count = ${reviewCount},
          updated_at = now()
      where id = ${plantId}
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to submit review', 500);
  }
}

