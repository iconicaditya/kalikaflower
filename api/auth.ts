import { fail } from '../src/server/lib/http';

type RouteHandler = (request: Request) => Promise<Response>;
type RouteLoader = () => Promise<{ default: RouteHandler }>;

const ROUTES: Record<string, RouteLoader> = {
  login: () => import('../src/server/handlers/auth/login'),
  signup: () => import('../src/server/handlers/auth/signup'),
  session: () => import('../src/server/handlers/auth/session'),
  logout: () => import('../src/server/handlers/auth/logout'),
};

function getRoute(request: Request) {
  const route = new URL(request.url).searchParams.get('route') ?? '';
  return route.trim().replace(/^\/+|\/+$/g, '');
}

export default async function handler(request: Request) {
  try {
    const route = getRoute(request);
    const routeLoader = ROUTES[route];

    if (!routeLoader) {
      return fail('Not found', 404);
    }

    const routeModule = await routeLoader();
    return routeModule.default(request);
  } catch (error) {
    return fail((error as Error).message || 'Internal server error', 500);
  }
}


