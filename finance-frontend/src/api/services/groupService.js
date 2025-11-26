import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const groupService = {
  async getGroups(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.GROUPS.LIST, { params });
    return response.data || response;
  },

  async createGroup(data) {
    const response = await axiosInstance.post(ENDPOINTS.GROUPS.CREATE, data);
    return response.data || response;
  },

  async updateGroup(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.GROUPS.UPDATE(id), data);
    return response.data || response;
  },

  async deleteGroup(id) {
    return axiosInstance.delete(ENDPOINTS.GROUPS.DELETE(id));
  },
};

