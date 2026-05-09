import { sql } from '@/server/lib/db';

export async function runMigrations() {
  await sql.begin(async (tx) => {
    await tx`
      create extension if not exists "pgcrypto";
    `;

    await tx`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        handle text not null unique,
        password_hash text not null,
        full_name text,
        first_name text,
        last_name text,
        avatar_url text,
        roles text[] not null default array[]::text[],
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `;

    await tx`
      alter table users
      add column if not exists full_name text;
    `;

    await tx`
      create table if not exists plants (
        id uuid primary key default gen_random_uuid(),
        slug text not null unique,
        name text not null,
        botanical_name text not null,
        category text not null,
        price numeric(12,2) not null,
        compare_at_price numeric(12,2),
        currency text not null default 'NPR',
        short_description text not null,
        description text not null,
        care_level text not null,
        light text not null,
        water text not null,
        height text not null,
        pot_included boolean not null default true,
        images text[] not null default array[]::text[],
        tags text[] not null default array[]::text[],
        in_stock boolean not null default true,
        stock_count integer not null default 0,
        featured boolean not null default false,
        new_arrival boolean not null default false,
        bestseller boolean not null default false,
        rating numeric(3,1) not null default 0,
        review_count integer not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `;

    await tx`create index if not exists idx_plants_category on plants(category);`;
    await tx`create index if not exists idx_plants_featured on plants(featured);`;
    await tx`create index if not exists idx_plants_new_arrival on plants(new_arrival);`;
    await tx`create index if not exists idx_plants_bestseller on plants(bestseller);`;

    await tx`
      create table if not exists reviews (
        id uuid primary key default gen_random_uuid(),
        plant_id uuid not null references plants(id) on delete cascade,
        user_id uuid references users(id) on delete set null,
        author_name text not null,
        location text not null,
        rating integer not null,
        title text not null,
        body text not null,
        verified boolean not null default false,
        created_at timestamptz not null default now()
      );
    `;

    await tx`create index if not exists idx_reviews_plant on reviews(plant_id);`;
    await tx`create index if not exists idx_reviews_created on reviews(created_at desc);`;

    await tx`
      create table if not exists testimonials (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        location text not null,
        quote text not null,
        rating integer not null,
        avatar_seed text not null,
        featured boolean not null default false,
        created_at timestamptz not null default now()
      );
    `;

    await tx`create index if not exists idx_testimonials_featured on testimonials(featured);`;

    await tx`
      create table if not exists carts (
        id uuid primary key default gen_random_uuid(),
        session_id text not null unique,
        user_id uuid references users(id) on delete set null,
        items jsonb not null default '[]'::jsonb,
        updated_at timestamptz not null default now()
      );
    `;

    await tx`
      create table if not exists orders (
        id uuid primary key default gen_random_uuid(),
        order_number text not null unique,
        user_id uuid references users(id) on delete set null,
        email text not null,
        full_name text not null,
        phone text not null,
        address text not null,
        city text not null,
        notes text,
        items jsonb not null default '[]'::jsonb,
        subtotal numeric(12,2) not null,
        shipping numeric(12,2) not null,
        total numeric(12,2) not null,
        status text not null,
        created_at timestamptz not null default now()
      );
    `;

    await tx`create index if not exists idx_orders_email on orders(email);`;
    await tx`create index if not exists idx_orders_created on orders(created_at desc);`;

    await tx`
      create table if not exists newsletter_subscribers (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        created_at timestamptz not null default now()
      );
    `;

    await tx`
      create table if not exists contact_messages (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text not null,
        subject text not null,
        message text not null,
        created_at timestamptz not null default now()
      );
    `;

    await tx`create index if not exists idx_contact_created on contact_messages(created_at desc);`;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

