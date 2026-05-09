-- Godawari Planthub Nursery
-- Neon PostgreSQL schema bootstrap
-- Safe to run manually in Neon SQL editor

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional helper trigger for updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  roles text[] NOT NULL DEFAULT array[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name text;

CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  botanical_name text NOT NULL,
  category text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  currency text NOT NULL DEFAULT 'NPR',
  short_description text NOT NULL,
  description text NOT NULL,
  care_level text NOT NULL,
  light text NOT NULL,
  water text NOT NULL,
  height text NOT NULL,
  pot_included boolean NOT NULL DEFAULT true,
  images text[] NOT NULL DEFAULT array[]::text[],
  tags text[] NOT NULL DEFAULT array[]::text[],
  in_stock boolean NOT NULL DEFAULT true,
  stock_count integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  rating numeric(3,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  location text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL,
  body text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  quote text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  avatar_seed text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0),
  shipping numeric(12,2) NOT NULL CHECK (shipping >= 0),
  total numeric(12,2) NOT NULL CHECK (total >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_featured ON plants(featured);
CREATE INDEX IF NOT EXISTS idx_plants_new_arrival ON plants(new_arrival);
CREATE INDEX IF NOT EXISTS idx_plants_bestseller ON plants(bestseller);

CREATE INDEX IF NOT EXISTS idx_reviews_plant ON reviews(plant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);

-- Attach update triggers (safe to re-run)
DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_plants_set_updated_at ON plants;
CREATE TRIGGER trg_plants_set_updated_at
BEFORE UPDATE ON plants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_carts_set_updated_at ON carts;
CREATE TRIGGER trg_carts_set_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;

