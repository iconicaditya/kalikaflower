import { fail } from '../src/server/lib/http';
import { runWebHandler } from '../src/server/lib/vercel';

type RouteHandler = (request: Request) => Promise<Response>;
type RouteLoader = () => Promise<{ default: RouteHandler }>;

const ROUTES: Record<string, RouteLoader> = {
  listPlants: () => import('../src/server/handlers/nursery/listPlants'),
  getPlant: () => import('../src/server/handlers/nursery/getPlant'),
  relatedPlants: () => import('../src/server/handlers/nursery/relatedPlants'),
  getReviews: () => import('../src/server/handlers/nursery/getReviews'),
  listTestimonials: () => import('../src/server/handlers/nursery/listTestimonials'),
  getCart: () => import('../src/server/handlers/nursery/getCart'),
  addToCart: () => import('../src/server/handlers/nursery/addToCart'),
  updateCartItem: () => import('../src/server/handlers/nursery/updateCartItem'),
  clearCart: () => import('../src/server/handlers/nursery/clearCart'),
  submitReview: () => import('../src/server/handlers/nursery/submitReview'),
  placeOrder: () => import('../src/server/handlers/nursery/placeOrder'),
  subscribeNewsletter: () => import('../src/server/handlers/nursery/subscribeNewsletter'),
  sendContact: () => import('../src/server/handlers/nursery/sendContact'),
};

function getRoute(request: Request) {
  const route = new URL(request.url).searchParams.get('route') ?? '';
  return route.trim().replace(/^\/+|\/+$/g, '');
}

async function webHandler(request: Request) {
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

export default async function handler(requestOrReq: Request | unknown, res?: unknown) {
  if (requestOrReq instanceof Request || !res) {
    return webHandler(requestOrReq as Request);
  }

  return runWebHandler(requestOrReq as never, res as never, webHandler);
}


