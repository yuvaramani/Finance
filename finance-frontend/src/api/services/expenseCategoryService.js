import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const expenseCategoryService = {
  async getCategories(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.EXPENSE_CATEGORIES.LIST, { params });
    return response.data || response;
  },

  async createCategory(data) {
    const response = await axiosInstance.post(ENDPOINTS.EXPENSE_CATEGORIES.CREATE, data);
    return response.data || response;
  },

  async updateCategory(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.EXPENSE_CATEGORIES.UPDATE(id), data);
    return response.data || response;
  },

  async deleteCategory(id) {
    return axiosInstance.delete(ENDPOINTS.EXPENSE_CATEGORIES.DELETE(id));
  },
};



