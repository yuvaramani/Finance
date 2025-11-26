import axiosInstance from "../axios";
import { ENDPOINTS } from "../endpoints";

export const incomeSourceService = {
  async getSources(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.INCOME_SOURCES.LIST, { params });
    return response.data || response;
  },

  async createSource(data) {
    const response = await axiosInstance.post(ENDPOINTS.INCOME_SOURCES.CREATE, data);
    return response.data || response;
  },

  async updateSource(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.INCOME_SOURCES.UPDATE(id), data);
    return response.data || response;
  },

  async deleteSource(id) {
    return axiosInstance.delete(ENDPOINTS.INCOME_SOURCES.DELETE(id));
  },
};



