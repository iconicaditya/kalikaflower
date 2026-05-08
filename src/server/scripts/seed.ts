import bcrypt from 'bcryptjs';
import { sql } from '@/server/lib/db';
import { PLANTS, REVIEW_SEEDS, TESTIMONIALS } from '@/server/data/nurserySeed';
import { runMigrations } from './migrate';

async function ensureDemoAdmin() {
  const handle = 'demo@modelence.dev';
  const passwordHash = await bcrypt.hash('12345678', 10);
  const adminRoles = ['admin'];

  await sql`
    insert into users (handle, password_hash, roles)
    values (${handle}, ${passwordHash}, ${adminRoles})
    on conflict (handle)
    do update set roles = (
      select array(
        select distinct role
        from unnest(coalesce(users.roles, array[]::text[]) || excluded.roles) as role
      )
    )
  `;
}

async function seedPlantsAndReviews() {
  const existing = await sql<{ count: string }[]>`select count(*)::text as count from plants`;
  if (Number(existing[0]?.count ?? 0) > 0) {
    return;
  }

  const now = Date.now();
  const slugToId = new Map<string, string>();

  for (let i = 0; i < PLANTS.length; i++) {
    const p = PLANTS[i];
    const createdAt = new Date(now - i * 60_000);
    const images = p.images;
    const tags = p.tags;

    const inserted = await sql<{ id: string }[]>`
      insert into plants (
        slug, name, botanical_name, category, price, compare_at_price, currency,
        short_description, description, care_level, light, water, height,
        pot_included, images, tags, in_stock, stock_count, featured,
        new_arrival, bestseller, rating, review_count, created_at, updated_at
      ) values (
        ${p.slug}, ${p.name}, ${p.botanicalName}, ${p.category}, ${p.price}, ${p.compareAtPrice ?? null}, 'NPR',
        ${p.shortDescription}, ${p.description}, ${p.careLevel}, ${p.light}, ${p.water}, ${p.height},
        ${p.potIncluded}, ${images}, ${tags}, ${p.inStock}, ${p.stockCount}, ${p.featured},
        ${p.newArrival}, ${p.bestseller}, ${p.rating}, ${p.reviewCount}, ${createdAt}, ${createdAt}
      )
      returning id
    `;

    slugToId.set(p.slug, inserted[0].id);
  }

  for (const review of REVIEW_SEEDS) {
    const plantId = slugToId.get(review.slug);
    if (!plantId) continue;

    await sql`
      insert into reviews (
        plant_id, author_name, location, rating, title, body, verified, created_at
      ) values (
        ${plantId}, ${review.authorName}, ${review.location}, ${review.rating},
        ${review.title}, ${review.body}, true,
        ${new Date(now - Math.random() * 30 * 24 * 3600_000)}
      )
    `;
  }
}

async function seedTestimonials() {
  const existing = await sql<{ count: string }[]>`select count(*)::text as count from testimonials`;
  if (Number(existing[0]?.count ?? 0) > 0) {
    return;
  }

  const now = Date.now();

  for (const t of TESTIMONIALS) {
    await sql`
      insert into testimonials (name, location, quote, rating, avatar_seed, featured, created_at)
      values (
        ${t.name}, ${t.location}, ${t.quote}, ${t.rating}, ${t.avatarSeed}, ${t.featured},
        ${new Date(now - Math.random() * 60 * 24 * 3600_000)}
      )
    `;
  }
}

export async function seedAll() {
  await runMigrations();
  await ensureDemoAdmin();
  await seedPlantsAndReviews();
  await seedTestimonials();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

