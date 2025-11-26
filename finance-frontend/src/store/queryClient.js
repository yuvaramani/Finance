import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
      onError: (error) => {
        console.error('[React Query] Query Error:', error);
      },
    },
    mutations: {
      retry: 0, // Don't retry mutations
      onError: (error) => {
        console.error('[React Query] Mutation Error:', error);
      },
    },
  },
});
