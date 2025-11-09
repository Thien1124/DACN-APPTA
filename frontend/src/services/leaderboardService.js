import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (period = 'weekly', limit = 50) => {
    const response = await axiosInstance.get('/leaderboard', {
      params: { period, limit },
    });
    return response.data;
  },

  // Get user rank
  getUserRank: async () => {
    const response = await axiosInstance.get('/leaderboard/rank');
    return response.data;
  },

  // Get friends leaderboard
  getFriendsLeaderboard: async () => {
    const response = await axiosInstance.get('/leaderboard/friends');
    return response.data;
  },

  // Get league info
  getLeagueInfo: async () => {
    const response = await axiosInstance.get('/leaderboard/league');
    return response.data;
  },
};

export default leaderboardService;