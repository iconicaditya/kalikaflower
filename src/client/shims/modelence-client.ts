export {
  SessionProvider,
  getConfig,
  loginWithPassword,
  logout,
  signupWithPassword,
  useSession,
} from '@/client/lib/apiClient';

type RenderAppOptions = {
  routesElement: JSX.Element;
  errorHandler?: (error: Error) => void;
  loadingElement?: JSX.Element;
  favicon?: string;
};

export function renderApp({ routesElement, favicon }: RenderAppOptions) {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  if (favicon) {
    const existing = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (existing) existing.href = favicon;
  }

  import('react-dom/client').then(({ createRoot }) => {
    createRoot(root).render(routesElement);
  });
}

