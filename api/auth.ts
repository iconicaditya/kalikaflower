import { fail } from '@/server/lib/http';
import login from '@/server/handlers/auth/login';
import logout from '@/server/handlers/auth/logout';
import session from '@/server/handlers/auth/session';
import signup from '@/server/handlers/auth/signup';

type RouteHandler = (request: Request) => Promise<Response>;

const ROUTES: Record<string, RouteHandler> = {
  login,
  signup,
  session,
  logout,
};

function getRoute(request: Request) {
  const route = new URL(request.url).searchParams.get('route') ?? '';
  return route.trim().replace(/^\/+|\/+$/g, '');
}

export default async function handler(request: Request) {
  const route = getRoute(request);
  const routeHandler = ROUTES[route];

  if (!routeHandler) {
    return fail('Not found', 404);
  }

  return routeHandler(request);
}

