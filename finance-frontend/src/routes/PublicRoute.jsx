import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 * Prevents authenticated users from accessing login/register pages
 */
export default function PublicRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
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
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render children (login/register page)
  return children;
}
