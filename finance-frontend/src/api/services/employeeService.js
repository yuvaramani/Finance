import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

/**
 * Employee Service
 * Handles all employee-related API calls
 */

export const employeeService = {
  /**
   * Get all employees
   * @param {Object} params - Query parameters (search, status, etc.)
   * @returns {Promise} List of employees
   */
  async getEmployees(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.EMPLOYEES.LIST, { params });
    // Return just the data portion (response structure: { success, message, data: { employees } })
    return response.data || response;
  },

  /**
   * Get single employee by ID
   * @param {number} id - Employee ID
   * @returns {Promise} Employee data
   */
  async getEmployee(id) {
    const response = await axiosInstance.get(ENDPOINTS.EMPLOYEES.DETAIL(id));
    return response.data || response;
  },

  /**
   * Create new employee
   * @param {Object} data - Employee data
   * @returns {Promise} Created employee data
   */
  async createEmployee(data) {
    const response = await axiosInstance.post(ENDPOINTS.EMPLOYEES.CREATE, data);
    return response.data || response;
  },

  /**
   * Update employee
   * @param {number} id - Employee ID
   * @param {Object} data - Updated employee data
   * @returns {Promise} Updated employee data
   */
  async updateEmployee(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.EMPLOYEES.UPDATE(id), data);
    return response.data || response;
  },

  /**
   * Delete employee
   * @param {number} id - Employee ID
   * @returns {Promise}
   */
  async deleteEmployee(id) {
    return axiosInstance.delete(ENDPOINTS.EMPLOYEES.DELETE(id));
  },

  /**
   * Archive employee
   * @param {number} id - Employee ID
   * @returns {Promise} Archived employee data
   */
  async archiveEmployee(id) {
    const response = await axiosInstance.post(ENDPOINTS.EMPLOYEES.ARCHIVE(id));
    return response.data || response;
  },
};



