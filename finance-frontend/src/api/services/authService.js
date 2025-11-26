import axiosInstance, { fetchCsrfCookie } from '../axios';
import { ENDPOINTS } from '../endpoints';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise} User data and token
   */
  async login(credentials) {
    // Fetch CSRF cookie before login (Sanctum requirement)
    await fetchCsrfCookie();

    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, credentials);
    // Return just the data portion (response structure: { success, message, data: { user, token } })
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} data - { name, email, password, password_confirmation }
   * @returns {Promise} User data and token
   */
  async register(data) {
    // Fetch CSRF cookie before registration
    await fetchCsrfCookie();

    const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, data);
    // Return just the data portion (response structure: { success, message, data: { user, token } })
    return response.data;
  },

  /**
   * Logout current user
   * @returns {Promise}
   */
  async logout() {
    return axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Get current authenticated user
   * @returns {Promise} User data
   */
  async getUser() {
    const response = await axiosInstance.get(ENDPOINTS.AUTH.USER);
    // Return just the data portion (response structure: { success, message, data: { user } })
    return response.data;
  },

  /**
   * Refresh authentication token
   * @returns {Promise}
   */
  async refresh() {
    return axiosInstance.post(ENDPOINTS.AUTH.REFRESH);
  },
};
