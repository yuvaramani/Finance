import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const expenseService = {
  async getExpenses(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.EXPENSES.LIST, { params });
    return response.data || response;
  },

  async getExpense(id) {
    const response = await axiosInstance.get(ENDPOINTS.EXPENSES.DETAIL(id));
    return response.data || response;
  },

  async createExpense(data) {
    const response = await axiosInstance.post(ENDPOINTS.EXPENSES.CREATE, data);
    return response.data || response;
  },

  async updateExpense(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.EXPENSES.UPDATE(id), data);
    return response.data || response;
  },

  async deleteExpense(id) {
    return axiosInstance.delete(ENDPOINTS.EXPENSES.DELETE(id));
  },
};



