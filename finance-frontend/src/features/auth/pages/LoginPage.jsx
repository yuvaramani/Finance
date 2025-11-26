import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from 'notistack';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginMutation } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      enqueueSnackbar('Login successful! Welcome back.', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.message || 'Invalid email or password';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        overflow: 'hidden',
        // Gradient background matching Figma - gray/slate theme
        background: 'linear-gradient(135deg, #f9fafb 0%, rgba(248, 250, 252, 0.9) 50%, #f3f4f6 100%)',
      }}
    >
      {/* Financial Icons Background Pattern - Matching Figma exactly */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            color: '#9ca3af', // gray-400
          }}
        >
          {/* Top Left Icons */}
          <Typography
            sx={{
              position: 'absolute',
              top: '15%',
              left: '8%',
              fontSize: '3.75rem',
              fontWeight: 700,
              transform: 'rotate(12deg)',
            }}
          >
            $
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              fontSize: '3rem',
            }}
          >
            %
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '25%',
              left: '5%',
              fontSize: '4.5rem',
            }}
          >
            €
          </Typography>

          {/* Calculator watermark */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '5%',
              fontSize: '6rem',
              fontWeight: 300,
              letterSpacing: '0.1em',
            }}
          >
            CALCULATOR
          </Typography>

          {/* Right Side Icons */}
          <Typography
            sx={{
              position: 'absolute',
              top: '15%',
              right: '10%',
              fontSize: '3.75rem',
            }}
          >
            +
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '30%',
              right: '15%',
              fontSize: '4.5rem',
              fontWeight: 700,
            }}
          >
            $
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '25%',
              right: '5%',
              fontSize: '3rem',
              transform: 'rotate(-15deg)',
            }}
          >
            ∞
          </Typography>


          {/* Bottom Icons */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '12%',
              fontSize: '3.75rem',
            }}
          >
            ÷
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: '15%',
              left: '20%',
              fontSize: '4.5rem',
              transform: 'rotate(12deg)',
            }}
          >
            ¥
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: '25%',
              right: '10%',
              fontSize: '3.75rem',
            }}
          >
            ×
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: '18%',
              right: '18%',
              fontSize: '3rem',
              fontWeight: 700,
            }}
          >
            $
          </Typography>

          {/* Pie Chart Icon - Bottom Left */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '8%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid',
              borderColor: 'currentColor',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 40,
                height: 40,
                bgcolor: 'currentColor',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              }}
            />
          </Box>

          {/* Additional scattered symbols */}
          <Typography
            sx={{
              position: 'absolute',
              top: '45%',
              left: '25%',
              fontSize: '3rem',
            }}
          >
            $
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '60%',
              right: '25%',
              fontSize: '3.75rem',
              transform: 'rotate(-20deg)',
            }}
          >
            £
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              bottom: '35%',
              left: '18%',
              fontSize: '2.25rem',
            }}
          >
            %
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              top: '55%',
              right: '12%',
              fontSize: '3rem',
            }}
          >
            =
          </Typography>

          {/* Line Graph Icon - Bottom Right */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '12%',
              right: '8%',
              width: 96,
              height: 64,
              border: '4px solid',
              borderColor: 'currentColor',
              borderRadius: 1,
              p: 1,
            }}
          >
            <svg
              viewBox="0 0 80 40"
              style={{ width: '100%', height: '100%' }}
            >
              <polyline
                points="0,35 20,25 40,15 60,20 80,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </Box>
        </Box>
      </Box>


      {/* Login Card - Matching Figma exactly */}
      <Card
        sx={{
          maxWidth: 448, // max-w-md
          width: '100%',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
          borderRadius: 2,
          border: 'none',
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            pb: 4,
            pt: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Logo Icon - Matching Figma */}
          <Box
            sx={{
              mx: 'auto',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: '#10b981', // solid emerald-500
            }}
          >
            <AttachMoney sx={{ fontSize: 28, color: 'white', fontWeight: 700 }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#1f2937', // text-gray-800
              fontSize: '1.875rem',
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            sx={{
              color: '#10b981', // text-emerald-600
              fontSize: '1rem',
            }}
          >
            Sign in to manage your finances
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, pb: 6, pt: 0 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form - Matching Figma spacing (space-y-5) */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Username Field - Matching Figma (label says Username, but field is email for backend) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                component="label"
                htmlFor="email"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#10b981', // text-emerald-600
                }}
              >
                Username
              </Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                placeholder="Enter your username"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(249, 250, 251, 0.8)', // bg-gray-50/80
                    pl: 2.5, // pl-10 equivalent
                    '& fieldset': {
                      borderColor: '#e5e7eb', // border-gray-200
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db', // hover border gray-300
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981', // focus-visible:border-emerald-500
                      borderWidth: 2,
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 1.25,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0 }}>
                      <Person sx={{ fontSize: 16, color: '#10b981' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Password Field - Matching Figma */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                component="label"
                htmlFor="password"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#10b981', // text-emerald-600
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(249, 250, 251, 0.8)', // bg-gray-50/80
                    pl: 2.5, // pl-10 equivalent
                    '& fieldset': {
                      borderColor: '#e5e7eb', // border-gray-200
                    },
                    '&:hover fieldset': {
                      borderColor: '#d1d5db', // hover border gray-300
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981', // focus-visible:border-emerald-500
                      borderWidth: 2,
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 1.25,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0 }}>
                      <Lock sx={{ fontSize: 16, color: '#10b981' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#10b981' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Remember Me & Forgot Password - Matching Figma */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    sx={{
                      color: '#9ca3af', // border-gray-400
                      '&.Mui-checked': {
                        color: '#1f2937', // data-[state=checked]:bg-gray-800
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#374151', // text-gray-700
                    }}
                  >
                    Remember me
                  </Typography>
                }
              />
              <Link
                href="#"
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: '#10b981', // text-emerald-600
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#059669', // hover:text-emerald-700
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Sign In Button - Matching Figma solid emerald */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              sx={{
                py: 1.5,
                bgcolor: '#10b981', // solid emerald-500
                color: 'white',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
                transition: 'all 0.2s',
                fontWeight: 500,
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#059669', // hover:bg-emerald-600
                },
                '&:disabled': {
                  bgcolor: '#d1d5db',
                },
              }}
            >
              {loginMutation.isPending ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Sign Up Link - Matching Figma */}
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: '#4b5563', // text-gray-600
                }}
              >
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#10b981', // text-emerald-600
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#059669', // hover:text-emerald-700
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
