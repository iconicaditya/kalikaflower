import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requireAdminRequest } from './_lib';

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

type PlantRef = { id: string; name: string };

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const reviews = body.plantId
      ? await sql<ReviewRow[]>`
          select id, plant_id, author_name, location, rating, title, body, verified, created_at
          from reviews
          where plant_id = ${body.plantId}
          order by created_at desc
          limit 200
        `
      : await sql<ReviewRow[]>`
          select id, plant_id, author_name, location, rating, title, body, verified, created_at
          from reviews
          order by created_at desc
          limit 200
        `;

    const plantIds = Array.from(new Set(reviews.map((r) => r.plant_id))).filter(Boolean);
    const plantRows = plantIds.length
      ? await sql<PlantRef[]>`
          select id, name
          from plants
          where id = any(${plantIds})
        `
      : [];

    const map = new Map(plantRows.map((p) => [p.id, p.name]));

    return ok(
      reviews.map((r) => ({
        _id: r.id,
        plantId: r.plant_id,
        plantName: map.get(r.plant_id) ?? 'Unknown',
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
    return fail((error as Error).message || 'Unable to list reviews', 500);
  }
}


