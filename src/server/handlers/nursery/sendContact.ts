import { sql } from '@/server/lib/db';
import { fail, ok } from '@/server/lib/http';
import { parseBody, requirePost } from './_lib';

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export default async function handler(request: Request) {
  try {
    await requirePost(request);
    const body = await parseBody<Body>(request);

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const subject = body.subject?.trim();
    const message = body.message?.trim();

    if (!name || !email || !subject || !message) {
      return fail('All fields are required', 400);
    }

    await sql`
      insert into contact_messages (name, email, subject, message, created_at)
      values (${name}, ${email}, ${subject}, ${message}, now())
    `;

    return ok({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return fail((error as Error).message || 'Unable to send message', 500);
  }
}

