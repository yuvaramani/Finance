
import axiosInstance from '../axios';

export const incomeSourceService = {
  /**
   * Get all income sources
   */
  async getIncomeSources() {
    const response = await axiosInstance.get('/income-sources');
    // Axios interceptor already returns response.data, so response is the unwrapped data
    // Return the full response object so component can access response.data.sources
    return response;
  },

  /**
   * Create a new income source
   * @param {Object} data - { name }
   */
  async createIncomeSource(data) {
    const response = await axiosInstance.post('/income-sources', data);
    return response;
  },

  /**
   * Update an income source
   * @param {number} id
   * @param {Object} data - { name }
   */
  async updateIncomeSource(id, data) {
    const response = await axiosInstance.put(`/income-sources/${id}`, data);
    return response;
  },

  /**
   * Delete an income source
   * @param {number} id
   */
  async deleteIncomeSource(id) {
    console.log(`Service: Deleting income source ${id}`);
    const response = await axiosInstance.delete(`/income-sources/${id}`);
    console.log(`Service: Delete response for ${id}:`, response);
    return response;
  }
};

