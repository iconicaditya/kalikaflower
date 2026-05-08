import {
  QueryFunctionContext,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { ReactNode, createContext, createElement, useContext, useMemo } from 'react';

type RoleName = string;

export type AppUser = {
  id: string;
  handle: string;
  roles: RoleName[];
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  hasRole: (role: RoleName) => boolean;
};

type SessionShape = {
  user: null | Omit<AppUser, 'hasRole'>;
};

const ConfigContext = createContext<Record<string, unknown>>({
  '_system.env.type': import.meta.env.DEV ? 'sandbox' : 'production',
  'example.modelenceDemoUsername': 'demo@modelence.dev',
  'example.modelenceDemoPassword': '12345678',
});

async function apiRequest<T>(
  endpoint: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
    ...init,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }

  return data as T;
}

function hydrateUser(user: SessionShape['user']): AppUser | null {
  if (!user) return null;
  const roles = user.roles ?? [];
  return {
    ...user,
    roles,
    hasRole: (role: string) => roles.includes(role),
  };
}

const SESSION_QUERY_KEY = ['auth.session'];

export function SessionProvider({ children }: { children: ReactNode }) {
  const config = useMemo(
    () => ({
      '_system.env.type': import.meta.env.DEV ? 'sandbox' : 'production',
      'example.modelenceDemoUsername': 'demo@modelence.dev',
      'example.modelenceDemoPassword': '12345678',
    }),
    []
  );

  return createElement(ConfigContext.Provider, { value: config }, children);
}

export function getConfig(key: string): unknown {
  if (key === '_system.env.type') return import.meta.env.DEV ? 'sandbox' : 'production';
  if (key === 'example.modelenceDemoUsername') return 'demo@modelence.dev';
  if (key === 'example.modelenceDemoPassword') return '12345678';
  return undefined;
}

export function useSession(): { user: AppUser | null; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => apiRequest<SessionShape>('/api/auth/session', {}),
    staleTime: 30_000,
  });

  return {
    user: hydrateUser(data?.user ?? null),
    isLoading,
  };
}

export async function loginWithPassword(args: { email: string; password: string }) {
  return apiRequest<{ ok: true; user: SessionShape['user'] }>('/api/auth/login', args);
}

export async function signupWithPassword(args: { email: string; password: string }) {
  return apiRequest<{ ok: true; user: SessionShape['user'] }>('/api/auth/signup', args);
}

export async function logout() {
  return apiRequest<{ ok: true }>('/api/auth/logout', {});
}

type RpcMap = Record<string, string>;

const QUERY_ROUTES: RpcMap = {
  'nursery.listPlants': '/api/nursery/listPlants',
  'nursery.getPlant': '/api/nursery/getPlant',
  'nursery.relatedPlants': '/api/nursery/relatedPlants',
  'nursery.getReviews': '/api/nursery/getReviews',
  'nursery.listTestimonials': '/api/nursery/listTestimonials',
  'nursery.getCart': '/api/nursery/getCart',
  'example.getItem': '/api/example/getItem',

  'admin.overview': '/api/admin/overview',
  'admin.listPlants': '/api/admin/listPlants',
  'admin.getPlant': '/api/admin/getPlant',
  'admin.listOrders': '/api/admin/listOrders',
  'admin.getOrder': '/api/admin/getOrder',
  'admin.listReviews': '/api/admin/listReviews',
  'admin.listTestimonials': '/api/admin/listTestimonials',
  'admin.listSubscribers': '/api/admin/listSubscribers',
  'admin.listMessages': '/api/admin/listMessages',
};

const MUTATION_ROUTES: RpcMap = {
  'nursery.addToCart': '/api/nursery/addToCart',
  'nursery.updateCartItem': '/api/nursery/updateCartItem',
  'nursery.clearCart': '/api/nursery/clearCart',
  'nursery.submitReview': '/api/nursery/submitReview',
  'nursery.placeOrder': '/api/nursery/placeOrder',
  'nursery.subscribeNewsletter': '/api/nursery/subscribeNewsletter',
  'nursery.sendContact': '/api/nursery/sendContact',

  'admin.createPlant': '/api/admin/createPlant',
  'admin.updatePlant': '/api/admin/updatePlant',
  'admin.deletePlant': '/api/admin/deletePlant',
  'admin.updateOrderStatus': '/api/admin/updateOrderStatus',
  'admin.deleteReview': '/api/admin/deleteReview',
  'admin.saveTestimonial': '/api/admin/saveTestimonial',
  'admin.deleteTestimonial': '/api/admin/deleteTestimonial',
  'admin.deleteSubscriber': '/api/admin/deleteSubscriber',
  'admin.deleteMessage': '/api/admin/deleteMessage',
  'admin.uploadImage': '/api/admin/uploadImage',

  'example.createItem': '/api/example/createItem',
};

function ensureRoute(routes: RpcMap, name: string) {
  const route = routes[name];
  if (!route) throw new Error(`RPC route not found for: ${name}`);
  return route;
}

export function createQueryKey(name: string, args: unknown) {
  return [name, args ?? {}] as const;
}

export function modelenceQuery<T = unknown>(name: string, args: unknown) {
  const route = ensureRoute(QUERY_ROUTES, name);
  return {
    queryKey: createQueryKey(name, args),
    queryFn: async (_ctx: QueryFunctionContext) => {
      return apiRequest<T>(route, args ?? {});
    },
  };
}

export function modelenceMutation<T = unknown>(name: string) {
  const route = ensureRoute(MUTATION_ROUTES, name);
  return {
    mutationFn: async (args: unknown) => {
      return apiRequest<T>(route, args ?? {});
    },
  };
}

export function useApiSessionQuery(): UseQueryResult<SessionShape> {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => apiRequest<SessionShape>('/api/auth/session', {}),
    staleTime: 30_000,
  });
}

export function useAppConfig() {
  return useContext(ConfigContext);
}

export { apiRequest };

