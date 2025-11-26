import axiosInstance from '../axios';
import { ENDPOINTS } from '../endpoints';

export const projectService = {
  async getProjects(params = {}) {
    const response = await axiosInstance.get(ENDPOINTS.PROJECTS.LIST, { params });
    return response.data || response;
  },

  async createProject(data) {
    const response = await axiosInstance.post(ENDPOINTS.PROJECTS.CREATE, data);
    return response.data || response;
  },

  async updateProject(id, data) {
    const response = await axiosInstance.put(ENDPOINTS.PROJECTS.UPDATE(id), data);
    return response.data || response;
  },

  async deleteProject(id) {
    return axiosInstance.delete(ENDPOINTS.PROJECTS.DELETE(id));
  },
};

