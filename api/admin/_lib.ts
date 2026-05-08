import { getSessionUser, requireAdmin } from '@/server/lib/auth';
import { sql } from '@/server/lib/db';
import { fail, readJson } from '@/server/lib/http';

export async function requireAdminRequest(request: Request) {
  if (request.method !== 'POST') {
    throw fail('Method not allowed', 405);
  }
  const user = await getSessionUser(request);
  try {
    requireAdmin(user);
  } catch (error) {
    throw fail((error as Error).message, 403);
  }
  return user;
}

export async function parseBody<T = unknown>(request: Request): Promise<T> {
  return readJson<T>(request);
}

export type PlantRow = {
  id: string;
  slug: string;
  name: string;
  botanical_name: string;
  category: string;
  price: string | number;
  compare_at_price: string | number | null;
  currency: string;
  short_description: string;
  description: string;
  care_level: string;
  light: string;
  water: string;
  height: string;
  pot_included: boolean;
  images: string[];
  tags: string[];
  in_stock: boolean;
  stock_count: number;
  featured: boolean;
  new_arrival: boolean;
  bestseller: boolean;
  rating: string | number;
  review_count: number;
  created_at: string | Date;
};

export function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === 'number' ? v : Number(v);
}

export function plantOut(p: PlantRow) {
  return {
    _id: p.id,
    slug: p.slug,
    name: p.name,
    botanicalName: p.botanical_name,
    category: p.category,
    price: num(p.price),
    compareAtPrice: p.compare_at_price == null ? null : num(p.compare_at_price),
    currency: p.currency,
    shortDescription: p.short_description,
    description: p.description,
    careLevel: p.care_level,
    light: p.light,
    water: p.water,
    height: p.height,
    potIncluded: p.pot_included,
    images: p.images ?? [],
    tags: p.tags ?? [],
    inStock: p.in_stock,
    stockCount: p.stock_count,
    featured: p.featured,
    newArrival: p.new_arrival,
    bestseller: p.bestseller,
    rating: num(p.rating),
    reviewCount: p.review_count,
    createdAt: p.created_at,
  };
}

export async function recomputePlantRating(plantId: string) {
  const agg = await sql<Array<{ avg_rating: string | null; review_count: string }>>`
    select avg(rating)::text as avg_rating, count(*)::text as review_count
    from reviews
    where plant_id = ${plantId}
  `;

  const avg = Number(agg[0]?.avg_rating ?? 0);
  const count = Number(agg[0]?.review_count ?? 0);

  await sql`
    update plants
    set rating = ${Math.round(avg * 10) / 10},
        review_count = ${count},
        updated_at = now()
    where id = ${plantId}
  `;
}

