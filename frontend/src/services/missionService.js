// frontend/src/services/missionService.js
import api from '../utils/api';

export const missionService = {
  getMissions: async () => {
    const response = await api.get('/missions');
    return response.data;
  },
  
  updateProgress: async (missionId, progress) => {
    const response = await api.post('/missions/progress', { 
      missionId, 
      progress 
    });
    return response.data;
  },
  
  claimReward: async (missionId) => {
    const response = await api.post('/missions/claim-reward', { missionId });
    return response.data;
  }
};