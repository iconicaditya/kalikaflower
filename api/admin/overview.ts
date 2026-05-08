import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { num, plantOut, PlantRow, requireAdminRequest } from './_lib';

type OrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  total: string | number;
  status: string;
  created_at: string | Date;
  items: unknown[];
};

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  created_at: string | Date;
};

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);

    const countsResult = await sql<
      Array<{
        plants_count: string;
        orders_count: string;
        reviews_count: string;
        subs_count: string;
        msgs_count: string;
      }>
    >`
      select
        (select count(*)::text from plants) as plants_count,
        (select count(*)::text from orders) as orders_count,
        (select count(*)::text from reviews) as reviews_count,
        (select count(*)::text from newsletter_subscribers) as subs_count,
        (select count(*)::text from contact_messages) as msgs_count
    `;
    const counts = countsResult[0];

    const [recentOrders, recentMessages, topPlants, allOrders] = await Promise.all([
      sql<OrderRow[]>`
        select id, order_number, full_name, email, total, status, created_at, items
        from orders
        order by created_at desc
        limit 6
      `,
      sql<MessageRow[]>`
        select id, name, email, subject, created_at
        from contact_messages
        order by created_at desc
        limit 5
      `,
      sql<PlantRow[]>`
        select id, slug, name, botanical_name, category, price, compare_at_price, currency,
               short_description, description, care_level, light, water, height,
               pot_included, images, tags, in_stock, stock_count, featured,
               new_arrival, bestseller, rating, review_count, created_at
        from plants
        order by rating desc, review_count desc
        limit 5
      `,
      sql<Array<{ total: string | number; status: string }>>`
        select total, status from orders
      `,
    ]);

    const revenue = allOrders.reduce((sum, o) => sum + num(o.total), 0);
    const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

    return ok({
      stats: {
        plantsCount: Number(counts?.plants_count ?? 0),
        ordersCount: Number(counts?.orders_count ?? 0),
        reviewsCount: Number(counts?.reviews_count ?? 0),
        subsCount: Number(counts?.subs_count ?? 0),
        msgsCount: Number(counts?.msgs_count ?? 0),
        revenue,
        pendingOrders,
      },
      recentOrders: recentOrders.map((o) => ({
        _id: o.id,
        orderNumber: o.order_number,
        fullName: o.full_name,
        email: o.email,
        total: num(o.total),
        status: o.status,
        createdAt: o.created_at,
        itemCount: Array.isArray(o.items) ? o.items.length : 0,
      })),
      recentMessages: recentMessages.map((m) => ({
        _id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        createdAt: m.created_at,
      })),
      topPlants: topPlants.map(plantOut),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to load overview', 500);
  }
}

