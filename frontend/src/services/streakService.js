import api from '../utils/api';

export const streakService = {
  // POST /api/streaks/update (có chữ s)
  updateStreak: async () => {
    try {
      const response = await api.post('/streaks/update'); // Thêm chữ s
      return {
        success: true,
        currentStreak: response.data.streak || 0,
        lastActivityDate: response.data.lastActivityDate || new Date()
      };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  // GET /api/streaks (có chữ s)
  getStreak: async () => {
    try {
      const response = await api.get('/streaks'); // Thêm chữ s
      console.log('Streak API Response:', response.data); // Debug
      
      return {
        success: true,
        currentStreak: response.data.streak?.count || 0,
        lastActivityDate: response.data.streak?.lastActivityDate || null
      };
    } catch (error) {
      console.error('Error getting streak:', error);
      // Return default values instead of throwing
      return {
        success: false,
        currentStreak: 0,
        lastActivityDate: null
      };
    }
  }
};