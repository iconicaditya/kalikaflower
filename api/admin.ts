import { fail } from '@/server/lib/http';

type RouteHandler = (request: Request) => Promise<Response>;
type RouteLoader = () => Promise<{ default: RouteHandler }>;

const ROUTES: Record<string, RouteLoader> = {
  overview: () => import('@/server/handlers/admin/overview'),
  listPlants: () => import('@/server/handlers/admin/listPlants'),
  getPlant: () => import('@/server/handlers/admin/getPlant'),
  listOrders: () => import('@/server/handlers/admin/listOrders'),
  getOrder: () => import('@/server/handlers/admin/getOrder'),
  listReviews: () => import('@/server/handlers/admin/listReviews'),
  listTestimonials: () => import('@/server/handlers/admin/listTestimonials'),
  listSubscribers: () => import('@/server/handlers/admin/listSubscribers'),
  listMessages: () => import('@/server/handlers/admin/listMessages'),
  createPlant: () => import('@/server/handlers/admin/createPlant'),
  updatePlant: () => import('@/server/handlers/admin/updatePlant'),
  deletePlant: () => import('@/server/handlers/admin/deletePlant'),
  updateOrderStatus: () => import('@/server/handlers/admin/updateOrderStatus'),
  deleteReview: () => import('@/server/handlers/admin/deleteReview'),
  saveTestimonial: () => import('@/server/handlers/admin/saveTestimonial'),
  deleteTestimonial: () => import('@/server/handlers/admin/deleteTestimonial'),
  deleteSubscriber: () => import('@/server/handlers/admin/deleteSubscriber'),
  deleteMessage: () => import('@/server/handlers/admin/deleteMessage'),
  uploadImage: () => import('@/server/handlers/admin/uploadImage'),
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

