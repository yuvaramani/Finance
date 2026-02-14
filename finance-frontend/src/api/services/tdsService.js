import axios from 'axios';

export const tdsService = {
  async exportQuarter(fyStart, quarter) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_PREFIX = import.meta.env.VITE_API_PREFIX;
    const token = localStorage.getItem('auth_token');

    const response = await axios.get(`${API_BASE_URL}${API_PREFIX}/tds/quarter-export`, {
      params: { fy_start: fyStart, quarter },
      responseType: 'blob',
      withCredentials: true,
      withXSRFToken: true,
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response;
  },
};
