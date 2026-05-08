import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouteObject, useLocation, useSearchParams } from 'react-router-dom';
import { useSession } from 'modelence/client';

function GuestRoute() {
  const { user } = useSession();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const encodedRedirect = searchParams.get('_redirect');
  const redirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : '/';

  if (user) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function PrivateRoute() {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?_redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }
  return <Outlet />;
}

function AdminRoute() {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?_redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }
  if (!user.hasRole('admin')) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

const publicRoutes: RouteObject[] = [
  { path: '/', Component: lazy(() => import('./pages/HomePage')) },
  { path: '/shop', Component: lazy(() => import('./pages/ShopPage')) },
  { path: '/plant/:slug', Component: lazy(() => import('./pages/PlantPage')) },
  { path: '/cart', Component: lazy(() => import('./pages/CartPage')) },
  { path: '/checkout', Component: lazy(() => import('./pages/CheckoutPage')) },
  { path: '/order-confirmation', Component: lazy(() => import('./pages/OrderConfirmationPage')) },
  { path: '/about', Component: lazy(() => import('./pages/AboutPage')) },
  { path: '/locations', Component: lazy(() => import('./pages/LocationsPage')) },
  { path: '/care-guide', Component: lazy(() => import('./pages/CareGuidePage')) },
  { path: '/contact', Component: lazy(() => import('./pages/ContactPage')) },
  { path: '/concierge', Component: lazy(() => import('./pages/ConciergePage')) },
  { path: '/sustainability', Component: lazy(() => import('./pages/SustainabilityPage')) },
  { path: '/plant-finder', Component: lazy(() => import('./pages/PlantFinderPage')) },
  { path: '/wishlist', Component: lazy(() => import('./pages/WishlistPage')) },
  { path: '/terms', Component: lazy(() => import('./pages/TermsPage')) },
  { path: '/logout', Component: lazy(() => import('./pages/LogoutPage')) },
  { path: '*', Component: lazy(() => import('./pages/NotFoundPage')) },
];

const guestRoutes: RouteObject[] = [
  { path: '/login', Component: lazy(() => import('./pages/LoginPage')) },
  { path: '/signup', Component: lazy(() => import('./pages/SignupPage')) },
];

const privateRoutes: RouteObject[] = [
  { path: '/account', Component: lazy(() => import('./pages/AccountPage')) },
];

const adminRoutes: RouteObject[] = [
  { path: '/admin', Component: lazy(() => import('./pages/admin/AdminDashboard')) },
  { path: '/admin/plants', Component: lazy(() => import('./pages/admin/AdminPlants')) },
  { path: '/admin/plants/:id', Component: lazy(() => import('./pages/admin/AdminPlantEditor')) },
  { path: '/admin/orders', Component: lazy(() => import('./pages/admin/AdminOrders')) },
  { path: '/admin/orders/:id', Component: lazy(() => import('./pages/admin/AdminOrderDetail')) },
  { path: '/admin/reviews', Component: lazy(() => import('./pages/admin/AdminReviews')) },
  { path: '/admin/testimonials', Component: lazy(() => import('./pages/admin/AdminTestimonials')) },
  { path: '/admin/subscribers', Component: lazy(() => import('./pages/admin/AdminSubscribers')) },
  { path: '/admin/messages', Component: lazy(() => import('./pages/admin/AdminMessages')) },
];

export const router = createBrowserRouter([
  ...publicRoutes,
  { Component: GuestRoute, children: guestRoutes },
  { Component: PrivateRoute, children: privateRoutes },
  { Component: AdminRoute, children: adminRoutes },
]);
