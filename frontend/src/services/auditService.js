import api from '../utils/api';

export const auditService = {
  getAuditLogs: async (params) => {
    const response = await api.get('/audit', { params });
    return response.data;
  },
  
  getAuditStats: async (days) => {
    const response = await api.get(`/audit/stats?days=${days}`);
    return response.data;
  }
};
