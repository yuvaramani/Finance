import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@api/services/authService';

/**
 * Login Mutation Hook
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Store user in cache
      queryClient.setQueryData(['user'], data.user);

      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

/**
 * Register Mutation Hook
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (data) => {
      // Store user in cache
      queryClient.setQueryData(['user'], data.user);

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}

/**
 * Logout Mutation Hook
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(['user'], null);

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');

      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);

      // Still clear local data even if API call fails
      queryClient.setQueryData(['user'], null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    },
  });
}
