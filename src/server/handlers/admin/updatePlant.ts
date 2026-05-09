import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, requireAdminRequest } from './_lib';

type Body = {
  id?: string;
  slug?: string;
  name?: string;
  botanicalName?: string;
  category?: string;
  price?: number;
  compareAtPrice?: number | null;
  currency?: string;
  shortDescription?: string;
  description?: string;
  careLevel?: string;
  light?: string;
  water?: string;
  height?: string;
  potIncluded?: boolean;
  images?: string[];
  tags?: string[];
  inStock?: boolean;
  stockCount?: number;
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);

    const id = body.id?.trim();
    const slug = body.slug?.trim();
    const name = body.name?.trim();
    const botanicalName = body.botanicalName?.trim();
    const category = body.category?.trim();
    const shortDescription = body.shortDescription?.trim();
    const description = body.description?.trim();
    const careLevel = body.careLevel?.trim();
    const light = body.light?.trim();
    const water = body.water?.trim();
    const height = body.height?.trim();
    const currency = body.currency?.trim() || 'NPR';
    const images = (body.images ?? []).map((x) => x?.trim()).filter(Boolean) as string[];
    const tags = (body.tags ?? []).map((x) => x?.trim()).filter(Boolean) as string[];
    const price = Number(body.price ?? 0);
    const compareAtPrice = body.compareAtPrice == null ? null : Number(body.compareAtPrice);
    const stockCount = Number(body.stockCount ?? 0);
    const potIncluded = Boolean(body.potIncluded);
    const inStock = Boolean(body.inStock);
    const featured = Boolean(body.featured);
    const newArrival = Boolean(body.newArrival);
    const bestseller = Boolean(body.bestseller);

    if (!id) return fail('id is required', 400);
    if (
      !slug ||
      !name ||
      !botanicalName ||
      !category ||
      !shortDescription ||
      !description ||
      !careLevel ||
      !light ||
      !water ||
      !height
    ) {
      return fail('Missing required plant fields', 400);
    }
    if (!Number.isFinite(price) || price < 0) return fail('Invalid price', 400);
    if (compareAtPrice != null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      return fail('Invalid compareAtPrice', 400);
    }
    if (!Number.isFinite(stockCount) || stockCount < 0) return fail('Invalid stockCount', 400);
    if (images.length < 1) return fail('At least one image is required', 400);

    const dup = await sql<Array<{ id: string }>>`
      select id
      from plants
      where slug = ${slug} and id <> ${id}
      limit 1
    `;
    if (dup[0]) {
      return fail('A plant with this slug already exists', 409);
    }

    const updated = await sql<Array<{ id: string }>>`
      update plants
      set slug = ${slug},
          name = ${name},
          botanical_name = ${botanicalName},
          category = ${category},
          price = ${price},
          compare_at_price = ${compareAtPrice},
          currency = ${currency},
          short_description = ${shortDescription},
          description = ${description},
          care_level = ${careLevel},
          light = ${light},
          water = ${water},
          height = ${height},
          pot_included = ${potIncluded},
          images = ${images},
          tags = ${tags},
          in_stock = ${inStock},
          stock_count = ${stockCount},
          featured = ${featured},
          new_arrival = ${newArrival},
          bestseller = ${bestseller},
          updated_at = now()
      where id = ${id}
      returning id
    `;

    if (!updated[0]) return fail('Plant not found', 404);
    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to update plant', 500);
  }
}


