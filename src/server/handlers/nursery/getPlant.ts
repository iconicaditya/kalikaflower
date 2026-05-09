import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, plantOut, PlantRow, requirePost } from './_lib';

type Body = { slug?: string };

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const slug = body.slug?.trim();
    if (!slug) return fail('slug is required', 400);

    const rows = await sql<PlantRow[]>`
      select id, slug, name, botanical_name, category, price, compare_at_price, currency,
             short_description, description, care_level, light, water, height,
             pot_included, images, tags, in_stock, stock_count, featured,
             new_arrival, bestseller, rating, review_count, created_at
      from plants
      where slug = ${slug}
      limit 1
    `;

    const row = rows[0];
    if (!row) return ok(null);
    return ok(plantOut(row));
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to get plant', 500);
  }
}


