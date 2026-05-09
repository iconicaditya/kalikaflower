import { sql } from '../../lib/db';
import { fail, readJson } from '../../lib/http';

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
  };
}

export async function requirePost(request: Request) {
  if (request.method !== 'POST') {
    throw fail('Method not allowed', 405);
  }
}

export async function parseBody<T = unknown>(request: Request): Promise<T> {
  return readJson<T>(request);
}

export function orderNumber() {
  return `GPH-${Date.now().toString(36).toUpperCase()}`;
}

export async function getCartWithPlants(sessionId: string) {
  const carts = await sql<Array<{ id: string; items: unknown[] }>>`
    select id, items
    from carts
    where session_id = ${sessionId}
    limit 1
  `;

  const cart = carts[0];
  if (!cart) return null;

  const items = (cart.items ?? []) as Array<{
    slug: string;
    quantity: number;
  }>;

  const slugs = items.map((i) => i.slug).filter(Boolean);
  if (!slugs.length) return { cartId: cart.id, items: [], plantMap: new Map<string, PlantRow>() };

  const plants = await sql<PlantRow[]>`
    select id, slug, name, botanical_name, category, price, compare_at_price, currency,
           short_description, description, care_level, light, water, height,
           pot_included, images, tags, in_stock, stock_count, featured,
           new_arrival, bestseller, rating, review_count, created_at
    from plants
    where slug = any(${slugs})
  `;

  return {
    cartId: cart.id,
    items,
    plantMap: new Map(plants.map((p) => [p.slug, p])),
  };
}


