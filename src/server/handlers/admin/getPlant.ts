import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, plantOut, PlantRow, requireAdminRequest } from './_lib';

type Body = { id?: string };

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);
    const id = body.id?.trim();
    if (!id) return fail('id is required', 400);

    const rows = await sql<PlantRow[]>`
      select id, slug, name, botanical_name, category, price, compare_at_price, currency,
             short_description, description, care_level, light, water, height,
             pot_included, images, tags, in_stock, stock_count, featured,
             new_arrival, bestseller, rating, review_count, created_at
      from plants
      where id = ${id}
      limit 1
    `;

    const row = rows[0];
    if (!row) return fail('Plant not found', 404);
    return ok(plantOut(row));
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to get plant', 500);
  }
}


