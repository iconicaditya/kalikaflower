import { sql } from '../../lib/db';
import { fail, ok } from '../../lib/http';
import { parseBody, recomputePlantRating, requireAdminRequest } from './_lib';

type Body = { id?: string };

export default async function handler(request: Request) {
  try {
    await requireAdminRequest(request);
    const body = await parseBody<Body>(request);
    const id = body.id?.trim();
    if (!id) return fail('id is required', 400);

    const deleted = await sql<Array<{ plant_id: string }>>`
      delete from reviews
      where id = ${id}
      returning plant_id
    `;

    const plantId = deleted[0]?.plant_id;
    if (!plantId) return fail('Review not found', 404);

    await recomputePlantRating(plantId);
    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to delete review', 500);
  }
}


