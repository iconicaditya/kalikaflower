import { fail } from '@/server/lib/http';
import addToCart from '@/server/handlers/nursery/addToCart';
import clearCart from '@/server/handlers/nursery/clearCart';
import getCart from '@/server/handlers/nursery/getCart';
import getPlant from '@/server/handlers/nursery/getPlant';
import getReviews from '@/server/handlers/nursery/getReviews';
import listPlants from '@/server/handlers/nursery/listPlants';
import listTestimonials from '@/server/handlers/nursery/listTestimonials';
import placeOrder from '@/server/handlers/nursery/placeOrder';
import relatedPlants from '@/server/handlers/nursery/relatedPlants';
import sendContact from '@/server/handlers/nursery/sendContact';
import submitReview from '@/server/handlers/nursery/submitReview';
import subscribeNewsletter from '@/server/handlers/nursery/subscribeNewsletter';
import updateCartItem from '@/server/handlers/nursery/updateCartItem';

type RouteHandler = (request: Request) => Promise<Response>;

const ROUTES: Record<string, RouteHandler> = {
  listPlants,
  getPlant,
  relatedPlants,
  getReviews,
  listTestimonials,
  getCart,
  addToCart,
  updateCartItem,
  clearCart,
  submitReview,
  placeOrder,
  subscribeNewsletter,
  sendContact,
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

