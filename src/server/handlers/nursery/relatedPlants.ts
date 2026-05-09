import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { parseBody, plantOut, PlantRow, requirePost } from './_lib';

type Body = {
  category?: string;
  excludeSlug?: string;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);
    const category = body.category?.trim();
    const excludeSlug = body.excludeSlug?.trim();

    if (!category || !excludeSlug) {
      return fail('category and excludeSlug are required', 400);
    }

    const rows = await sql<PlantRow[]>`
      select id, slug, name, botanical_name, category, price, compare_at_price, currency,
             short_description, description, care_level, light, water, height,
             pot_included, images, tags, in_stock, stock_count, featured,
             new_arrival, bestseller, rating, review_count, created_at
      from plants
      where category = ${category}
        and slug <> ${excludeSlug}
      order by rating desc
      limit 4
    `;

    return ok(rows.map(plantOut));
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to list related plants', 500);
  }
}

