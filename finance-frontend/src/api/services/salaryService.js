import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const salaryService = {
  async getSalaries(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.SALARIES.LIST, { params });
    return response.data || response;
  },

  async getSalary(id) {
    const response = await axiosInstance.get(ENDPOINTS.SALARIES.DETAIL(id));
    return response.data || response;
  },

  async createSalary(data) {
    const response = await axiosInstance.post(ENDPOINTS.SALARIES.CREATE, data);
    return response.data || response;
  },

  async updateSalary(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.SALARIES.UPDATE(id), data);
    return response.data || response;
  },

  async deleteSalary(id) {
    return axiosInstance.delete(ENDPOINTS.SALARIES.DELETE(id));
  },
};

