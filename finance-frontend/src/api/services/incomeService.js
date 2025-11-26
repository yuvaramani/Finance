import axiosInstance from "../axios";
import { ENDPOINTS } from "../endpoints";

export const incomeService = {
  async getIncomes(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.INCOMES.LIST, { params });
    return response.data || response;
  },

  async getIncome(id) {
    const response = await axiosInstance.get(ENDPOINTS.INCOMES.DETAIL(id));
    return response.data || response;
  },

  async createIncome(data) {
    const response = await axiosInstance.post(ENDPOINTS.INCOMES.CREATE, data);
    return response.data || response;
  },

  async updateIncome(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.INCOMES.UPDATE(id), data);
    return response.data || response;
  },

  async deleteIncome(id) {
    return axiosInstance.delete(ENDPOINTS.INCOMES.DELETE(id));
  },
};



