import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const accountService = {
  async getAccounts(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTS.LIST, { params });
    return response.data || response;
  },

  async getAccount(id) {
    const response = await axiosInstance.get(ENDPOINTS.ACCOUNTS.DETAIL(id));
    return response.data || response;
  },

  async createAccount(data) {
    const response = await axiosInstance.post(ENDPOINTS.ACCOUNTS.CREATE, data);
    return response.data || response;
  },

  async updateAccount(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.ACCOUNTS.UPDATE(id), data);
    return response.data || response;
  },

  async deleteAccount(id) {
    return axiosInstance.delete(ENDPOINTS.ACCOUNTS.DELETE(id));
  },
};



