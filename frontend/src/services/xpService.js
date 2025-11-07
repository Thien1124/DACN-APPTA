import api from '../utils/api';

export const xpService = {
  // POST /api/xp/update
  updateXP: async (xpEarned) => {
    try {
      const response = await api.post('/xp/update', { xpEarned });
      console.log('XP Update Response:', response.data); // Debug
      
      return {
        success: true,
        totalXP: response.data.xp?.total || 0,
        level: response.data.xp?.level || 1,
        leveledUp: response.data.leveledUp || false
      };
    } catch (error) {
      console.error('Error updating XP:', error);
      throw error;
    }
  },

  // GET /api/xp
  getXP: async () => {
    try {
      const response = await api.get('/xp');
      console.log('XP API Response:', response.data); // Debug
      
      return {
        success: true,
        totalXP: response.data.xp?.total || 0,
        level: response.data.xp?.level || 1,
        nextLevelXP: response.data.nextLevelXP || 100,
        xpNeeded: response.data.xpNeeded || 100
      };
    } catch (error) {
      console.error('Error updating XP:', error);
      throw error;
    }
  }
};