import { fail } from '@/server/lib/http';
import createPlant from '@/server/handlers/admin/createPlant';
import deleteMessage from '@/server/handlers/admin/deleteMessage';
import deletePlant from '@/server/handlers/admin/deletePlant';
import deleteReview from '@/server/handlers/admin/deleteReview';
import deleteSubscriber from '@/server/handlers/admin/deleteSubscriber';
import deleteTestimonial from '@/server/handlers/admin/deleteTestimonial';
import getOrder from '@/server/handlers/admin/getOrder';
import getPlant from '@/server/handlers/admin/getPlant';
import listMessages from '@/server/handlers/admin/listMessages';
import listOrders from '@/server/handlers/admin/listOrders';
import listPlants from '@/server/handlers/admin/listPlants';
import listReviews from '@/server/handlers/admin/listReviews';
import listSubscribers from '@/server/handlers/admin/listSubscribers';
import listTestimonials from '@/server/handlers/admin/listTestimonials';
import overview from '@/server/handlers/admin/overview';
import saveTestimonial from '@/server/handlers/admin/saveTestimonial';
import updateOrderStatus from '@/server/handlers/admin/updateOrderStatus';
import updatePlant from '@/server/handlers/admin/updatePlant';
import uploadImage from '@/server/handlers/admin/uploadImage';

type RouteHandler = (request: Request) => Promise<Response>;

const ROUTES: Record<string, RouteHandler> = {
  overview,
  listPlants,
  getPlant,
  listOrders,
  getOrder,
  listReviews,
  listTestimonials,
  listSubscribers,
  listMessages,
  createPlant,
  updatePlant,
  deletePlant,
  updateOrderStatus,
  deleteReview,
  saveTestimonial,
  deleteTestimonial,
  deleteSubscriber,
  deleteMessage,
  uploadImage,
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

