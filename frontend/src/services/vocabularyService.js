import axios from 'axios';

import api from '../utils/api';
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

export const vocabularyService = {
  // Get all vocabularies
  getAllVocabularies: async (params = {}) => {
    const response = await axiosInstance.get('/vocabularies', { params });
    return response.data;
  },

  // Get vocabulary by ID
  getVocabularyById: async (id) => {
    const response = await axiosInstance.get(`/vocabularies/${id}`);
    return response.data;
  },

  // Create vocabulary
  createVocabulary: async (vocabularyData) => {
    const response = await axiosInstance.post('/vocabularies', vocabularyData);
    return response.data;
  },

  // Update vocabulary
  updateVocabulary: async (id, vocabularyData) => {
    const response = await axiosInstance.put(`/vocabularies/${id}`, vocabularyData);
    return response.data;
  },

  // Delete vocabulary
  deleteVocabulary: async (id) => {
    const response = await axiosInstance.delete(`/vocabularies/${id}`);
    return response.data;
  },

  // Search vocabularies
  searchVocabularies: async (query) => {
    const response = await axiosInstance.get('/vocabularies/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get vocabularies by level
  getVocabulariesByLevel: async (level) => {
    const response = await axiosInstance.get(`/vocabularies/level/${level}`);
    return response.data;
  },

  // Add vocabulary to user's list
  addToMyList: async (vocabularyId) => {
    const response = await axiosInstance.post(`/vocabularies/${vocabularyId}/add-to-list`);
    return response.data;
  },
  getByLesson: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/vocabularies`);
    return response.data;
  },
  
  // ✅ Lấy từ vựng đã học
  getLearnedVocabularies: async () => {
    const response = await axiosInstance.get('/vocabularies/learned');
    return response.data;
  },
  
  // ✅ Đánh dấu đã học
  markAsLearned: async (vocabularyId) => {
    const response = await axiosInstance.post(`/vocabularies/${vocabularyId}/learn`);
    return response.data;
  },
  
  // ✅ Đánh dấu/bỏ đánh dấu từ vựng
  toggleStar: async (vocabularyId, starred) => {
    const response = await axiosInstance.post(`/vocabularies/${vocabularyId}/star`, { starred });
    return response.data;
  }
};

export default vocabularyService;