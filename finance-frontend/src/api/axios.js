import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PREFIX = import.meta.env.VITE_API_PREFIX;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Enable sending cookies with requests (for Sanctum)
  withXSRFToken: true,   // IMPORTANT: Enable CSRF token handling
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
    }

    // Attach auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get CSRF token from cookie (Sanctum uses XSRF-TOKEN cookie)
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }

    // Return the data directly for cleaner usage
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';

      return Promise.reject(error);
    }

    // Handle 419 CSRF Token Mismatch (Sanctum)
    if (error.response?.status === 419) {
      // Re-fetch CSRF cookie and retry request
      try {
        await fetchCsrfCookie();
        return axiosInstance(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('[API] Access Forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('[API] Server Error:', error.response.data);
    }

    // Return structured error
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors || {},
      originalError: error,
    });
  }
);

// Helper function to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Fetch CSRF cookie from Laravel Sanctum
export async function fetchCsrfCookie() {
  try {
    await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('[CSRF] Failed to fetch CSRF cookie:', error);
    throw error;
  }
}

export default axiosInstance;
