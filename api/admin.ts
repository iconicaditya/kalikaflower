import { fail } from '../src/server/lib/http';
import { runWebHandler } from '../src/server/lib/vercel';

type RouteHandler = (request: Request) => Promise<Response>;
type RouteLoader = () => Promise<{ default: RouteHandler }>;

const ROUTES: Record<string, RouteLoader> = {
  overview: () => import('../src/server/handlers/admin/overview'),
  listPlants: () => import('../src/server/handlers/admin/listPlants'),
  getPlant: () => import('../src/server/handlers/admin/getPlant'),
  listOrders: () => import('../src/server/handlers/admin/listOrders'),
  getOrder: () => import('../src/server/handlers/admin/getOrder'),
  listReviews: () => import('../src/server/handlers/admin/listReviews'),
  listTestimonials: () => import('../src/server/handlers/admin/listTestimonials'),
  listSubscribers: () => import('../src/server/handlers/admin/listSubscribers'),
  listMessages: () => import('../src/server/handlers/admin/listMessages'),
  createPlant: () => import('../src/server/handlers/admin/createPlant'),
  updatePlant: () => import('../src/server/handlers/admin/updatePlant'),
  deletePlant: () => import('../src/server/handlers/admin/deletePlant'),
  updateOrderStatus: () => import('../src/server/handlers/admin/updateOrderStatus'),
  deleteReview: () => import('../src/server/handlers/admin/deleteReview'),
  saveTestimonial: () => import('../src/server/handlers/admin/saveTestimonial'),
  deleteTestimonial: () => import('../src/server/handlers/admin/deleteTestimonial'),
  deleteSubscriber: () => import('../src/server/handlers/admin/deleteSubscriber'),
  deleteMessage: () => import('../src/server/handlers/admin/deleteMessage'),
  uploadImage: () => import('../src/server/handlers/admin/uploadImage'),
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
  if (res) {
    return runWebHandler(requestOrReq as never, res as never, webHandler);
  }

  return webHandler(requestOrReq as Request);
}


