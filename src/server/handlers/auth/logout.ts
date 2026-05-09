import { clearSessionCookie } from '../../lib/auth';
import { fail, ok } from '../../lib/http';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return fail('Method not allowed', 405);
  }

  return ok(
    { ok: true },
    {
      headers: {
        'set-cookie': clearSessionCookie(),
      },
    }
  );
}


