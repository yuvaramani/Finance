import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@api/services/authService';
import { useLoginMutation, useLogoutMutation, useRegisterMutation } from '@store/mutations/authMutations';

const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 * Manages global authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage with error handling
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser || storedUser === 'undefined' || storedUser === 'null' || storedUser.trim() === '') {
        return null;
      }
      return JSON.parse(storedUser);
    } catch (error) {
      // If JSON parsing fails, clear corrupted data and return null
      console.warn('Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  // Fetch user profile (only if we have a user in localStorage)
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getUser,
    enabled: false, // Disable automatic fetching - we get user from login/register
    staleTime: Infinity, // Keep data fresh since we update it manually
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    },
    onError: () => {
      // Clear invalid auth state
      setUser(null);
      localStorage.removeItem('user');
    },
  });

  // Mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  // Login function
  const login = async (credentials) => {
    try {
      const data = await loginMutation.mutateAsync(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await registerMutation.mutateAsync(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch (error) {
      // Still clear local state even if API call fails
      setUser(null);
      throw error;
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isError,
      login,
      register,
      logout,
      loginMutation,
      registerMutation,
      logoutMutation,
    }),
    [user, isLoading, isError, loginMutation, registerMutation, logoutMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
