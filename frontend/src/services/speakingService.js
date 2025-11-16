import api from '../utils/api';

// ========== VIDEO MANAGEMENT ==========

export const getAllVideos = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  
  const response = await api.get(`/speaking/videos?${params.toString()}`);
  return response.data;
};

export const getVideoById = async (videoId) => {
  const response = await api.get(`/speaking/videos/${videoId}`);
  return response.data;
};

export const createVideo = async (videoData) => {
  const response = await api.post('/speaking/admin/videos', videoData);
  return response.data;
};

export const updateVideo = async (videoId, videoData) => {
  const response = await api.put(`/speaking/admin/videos/${videoId}`, videoData);
  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await api.delete(`/speaking/admin/videos/${videoId}`);
  return response.data;
};

export const toggleVideoStatus = async (videoId) => {
  const response = await api.patch(`/speaking/admin/videos/${videoId}/toggle`);
  return response.data;
};

export const getVideoStats = async () => {
  const response = await api.get('/speaking/admin/stats');
  return response.data;
};

// ========== CAKE-STYLE PRACTICE ==========

export const getCakeProgress = async (videoId) => {
  const response = await api.get(`/speaking/cake/progress/${videoId}`);
  return response.data;
};

export const submitSentenceAudio = async (videoId, sentenceIndex, audioBlob) => {
  const formData = new FormData();
  formData.append('videoId', videoId);
  formData.append('sentenceIndex', sentenceIndex);
  formData.append('audio', audioBlob, `sentence_${sentenceIndex}.webm`);
  
  const response = await api.post('/speaking/cake/submit-sentence', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getAttemptResult = async (attemptId) => {
  const response = await api.get(`/speaking/attempts/${attemptId}`);
  return response.data;
};

// ========== USER STATISTICS ==========

export const getUserAttempts = async () => {
  const response = await api.get('/speaking/attempts/my');
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/speaking/stats/my');
  return response.data;
};

// ========== LEGACY FULL-TRANSCRIPT PRACTICE ==========

export const submitFullTranscript = async (videoId, audioBlob) => {
  const formData = new FormData();
  formData.append('videoId', videoId);
  formData.append('audio', audioBlob, 'recording.webm');
  
  const response = await api.post('/speaking/attempts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export default {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  getVideoStats,
  getCakeProgress,
  submitSentenceAudio,
  getAttemptResult,
  getUserAttempts,
  getUserStats,
  submitFullTranscript,
};
