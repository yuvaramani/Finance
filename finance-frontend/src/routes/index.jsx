import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Route Wrappers
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layouts
import MainLayout from '@components/layout/MainLayout/MainLayout';

// Lazy-loaded Pages
const LoginPage = lazy(() => import('@features/auth/pages/LoginPageNew'));
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));
const TransactionsPage = lazy(() => import('@features/transactions/pages/TransactionsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));
const UnauthorizedPage = lazy(() => import('@/pages/Unauthorized'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Router Configuration
const router = createBrowserRouter([
  // Public Routes (Login, Register)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <RegisterPage />
        </Suspense>
      </PublicRoute>
    ),
  },

  // Protected Routes (Require Authentication)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'transactions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TransactionsPage />
          </Suspense>
        ),
      },
      // Add more protected routes here
      // {
      //   path: 'budgets',
      //   element: <Suspense fallback={<PageLoader />}><BudgetsPage /></Suspense>,
      // },
      // {
      //   path: 'categories',
      //   element: <Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>,
      // },
      // {
      //   path: 'reports',
      //   element: <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>,
      // },
      // {
      //   path: 'goals',
      //   element: <Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>,
      // },
    ],
  },

  // Error Pages
  {
    path: '/unauthorized',
    element: (
      <Suspense fallback={<PageLoader />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;
