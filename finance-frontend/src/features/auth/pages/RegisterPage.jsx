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
  Alert,
  CircularProgress,
  Grid,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AccountBalance,
  Person,
  Phone,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from 'notistack';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerMutation } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    try {
      await register(formData);

      enqueueSnackbar('Registration successful! Welcome aboard.', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.message || 'Registration failed. Please try again.';
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
      }}
    >
      {/* Background with Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 80%, rgba(102, 187, 106, 0.15) 0%, transparent 50%)',
          },
        }}
      />

      {/* Decorative Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 128,
          height: 128,
          borderRadius: '50%',
          background: 'rgba(129, 199, 132, 0.2)',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(102, 187, 106, 0.2)',
          filter: 'blur(70px)',
          zIndex: 1,
        }}
      />

      {/* Register Card */}
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(129, 199, 132, 0.3)',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Icon */}
          <Box
            sx={{
              mx: 'auto',
              width: 80,
              height: 80,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
            }}
          >
            <AccountBalance sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              color: '#2E7D32',
              mb: 1,
            }}
          >
            Create Account
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{
              color: '#66BB6A',
              mb: 4,
            }}
          >
            Join us to start managing your finances
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#66BB6A' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#66BB6A',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4CAF50',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4CAF50',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#66BB6A' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#66BB6A' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Sign Up Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              sx={{
                mt: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                },
                '&:disabled': {
                  background: '#C8E6C9',
                },
              }}
            >
              {registerMutation.isPending ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign Up'
              )}
            </Button>

            {/* Sign In Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#66BB6A' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#2E7D32',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
