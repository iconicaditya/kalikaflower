import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { parseBody, requirePost } from './_lib';

type Body = { plantId?: string };

type ReviewRow = {
  id: string;
  plant_id: string;
  author_name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const plantId = body.plantId?.trim();
    if (!plantId) return fail('plantId is required', 400);

    const rows = await sql<ReviewRow[]>`
      select id, plant_id, author_name, location, rating, title, body, verified, created_at
      from reviews
      where plant_id = ${plantId}
      order by created_at desc
      limit 50
    `;

    return ok(
      rows.map((r) => ({
        _id: r.id,
        plantId: r.plant_id,
        authorName: r.author_name,
        location: r.location,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
        createdAt: r.created_at,
      }))
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to get reviews', 500);
  }
}

