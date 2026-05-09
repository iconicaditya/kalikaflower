import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, plantOut, PlantRow, requireAdminRequest } from './_lib';

type Body = {
  search?: string;
  category?: string;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const filters: string[] = [];
    const values: string[] = [];
    let i = 1;

    if (body.category && body.category !== 'all') {
      filters.push(`category = $${i++}`);
      values.push(body.category);
    }
    if (body.search?.trim()) {
      filters.push(`(name ilike $${i} or slug ilike $${i} or botanical_name ilike $${i})`);
      values.push(`%${body.search.trim()}%`);
      i += 1;
    }

    const where = filters.length ? `where ${filters.join(' and ')}` : '';

    const query = `
      select id, slug, name, botanical_name, category, price, compare_at_price, currency,
             short_description, description, care_level, light, water, height,
             pot_included, images, tags, in_stock, stock_count, featured,
             new_arrival, bestseller, rating, review_count, created_at
      from plants
      ${where}
      order by created_at desc
      limit 200
    `;

    const rows = await sql.unsafe<PlantRow[]>(query, values);
    return ok(rows.map(plantOut));
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list plants', 500);
  }
}


