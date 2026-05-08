import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { parseBody, plantOut, PlantRow, requirePost } from './_lib';

type Body = {
  category?: string;
  search?: string;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'name' | 'rating';
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  limit?: number;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);

    const filterParts: string[] = [];
    const values: (string | number | boolean)[] = [];
    let i = 1;

    if (body.category && body.category !== 'all') {
      filterParts.push(`category = $${i++}`);
      values.push(body.category);
    }
    if (body.featured) filterParts.push(`featured = true`);
    if (body.newArrival) filterParts.push(`new_arrival = true`);
    if (body.bestseller) filterParts.push(`bestseller = true`);
    if (body.search?.trim()) {
      filterParts.push(`(name ilike $${i} or botanical_name ilike $${i} or exists (
        select 1 from unnest(tags) t where t ilike $${i}
      ))`);
      values.push(`%${body.search.trim()}%`);
      i += 1;
    }

    const where = filterParts.length ? `where ${filterParts.join(' and ')}` : '';
    const orderBy =
      body.sort === 'price_asc'
        ? 'order by price asc'
        : body.sort === 'price_desc'
          ? 'order by price desc'
          : body.sort === 'name'
            ? 'order by name asc'
            : body.sort === 'rating'
              ? 'order by rating desc'
              : 'order by featured desc, created_at desc';

    const limit = Math.max(1, Math.min(body.limit ?? 100, 200));

    const query = `
      select id, slug, name, botanical_name, category, price, compare_at_price, currency,
             short_description, description, care_level, light, water, height,
             pot_included, images, tags, in_stock, stock_count, featured,
             new_arrival, bestseller, rating, review_count, created_at
      from plants
      ${where}
      ${orderBy}
      limit ${limit}
    `;

    const rows = await sql.unsafe<PlantRow[]>(query, values);
    return ok(rows.map(plantOut));
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list plants', 500);
  }
}

