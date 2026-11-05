import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: fresh data, instant client routing without repeated network requests
      gcTime: 1000 * 60 * 15, // 15 minutes: garbage collection time in memory cache
      refetchOnWindowFocus: false, // Prevents background re-fetching and flicker when switching browser tabs
      refetchOnMount: false, // Re-uses cached data on remount if within staleTime window
      retry: 1, // Single retry on transient network failures
    },
  },
});

export const queryKeys = {
  products: {
    all: ['products'] as const,
    active: () => [...queryKeys.products.all, 'active'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    variants: (productId: string) => [...queryKeys.products.all, 'variants', productId] as const,
  },
  categories: {
    all: ['categories'] as const,
    active: () => [...queryKeys.categories.all, 'active'] as const,
  },
  news: {
    all: ['news'] as const,
    published: () => [...queryKeys.news.all, 'published'] as const,
    setting: (slug: string) => [...queryKeys.news.all, 'setting', slug] as const,
  },
  orders: {
    all: ['orders'] as const,
    recent: () => [...queryKeys.orders.all, 'recent'] as const,
    list: (status?: string) => [...queryKeys.orders.all, 'list', status || 'all'] as const,
  },
  customers: {
    all: ['customers'] as const,
  },
  admin: {
    metrics: ['admin', 'metrics'] as const,
  },
};
