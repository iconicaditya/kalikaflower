import { getSessionUser } from '@/server/lib/auth';
import { fail, ok } from '@/server/lib/http';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return fail('Method not allowed', 405);
  }

  try {
    const user = await getSessionUser(request);
    return ok({ user });
  } catch (error) {
    return fail((error as Error).message || 'Unable to read session', 500);
  }
}

