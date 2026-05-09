import { fail } from '@/server/lib/http';

type RouteHandler = (request: Request) => Promise<Response>;
type RouteLoader = () => Promise<{ default: RouteHandler }>;

const ROUTES: Record<string, RouteLoader> = {
  listPlants: () => import('@/server/handlers/nursery/listPlants'),
  getPlant: () => import('@/server/handlers/nursery/getPlant'),
  relatedPlants: () => import('@/server/handlers/nursery/relatedPlants'),
  getReviews: () => import('@/server/handlers/nursery/getReviews'),
  listTestimonials: () => import('@/server/handlers/nursery/listTestimonials'),
  getCart: () => import('@/server/handlers/nursery/getCart'),
  addToCart: () => import('@/server/handlers/nursery/addToCart'),
  updateCartItem: () => import('@/server/handlers/nursery/updateCartItem'),
  clearCart: () => import('@/server/handlers/nursery/clearCart'),
  submitReview: () => import('@/server/handlers/nursery/submitReview'),
  placeOrder: () => import('@/server/handlers/nursery/placeOrder'),
  subscribeNewsletter: () => import('@/server/handlers/nursery/subscribeNewsletter'),
  sendContact: () => import('@/server/handlers/nursery/sendContact'),
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

