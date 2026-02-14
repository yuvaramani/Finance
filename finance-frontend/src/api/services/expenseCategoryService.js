
import axiosInstance from '../axios';

export const expenseCategoryService = {
  /**
   * Get all expense categories
   */
  async getExpenseCategories() {
    const response = await axiosInstance.get('/expense-categories');
    return response;
  },

  /**
   * Create a new expense category
   * @param {Object} data - { name }
   */
  async createExpenseCategory(data) {
    const response = await axiosInstance.post('/expense-categories', data);
    return response;
  },

  /**
   * Update an expense category
   * @param {number} id
   * @param {Object} data - { name }
   */
  async updateExpenseCategory(id, data) {
    const response = await axiosInstance.put(`/expense-categories/${id}`, data);
    return response;
  },

  /**
   * Delete an expense category
   * @param {number} id
   */
  async deleteExpenseCategory(id) {
    const response = await axiosInstance.delete(`/expense-categories/${id}`);
    return response;
  }
};


