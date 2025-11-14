import api from '../utils/api';

export const speechService = {
  /**
   * Analyze pronunciation from audio recording
   * @param {Blob} audioBlob - Audio recording blob
   * @param {string} flashcardId - Flashcard ID to compare against
   * @returns {Promise} Analysis result with scores
   */
  analyzePronunciation: async (audioBlob, flashcardId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('flashcardId', flashcardId);

    const response = await api.post('/speech/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Get speech attempt history
   * @param {Object} params - Query parameters
   * @returns {Promise} History list
   */
  getHistory: async (params = {}) => {
    const response = await api.get('/speech/history', { params });
    return response.data;
  },

  /**
   * Get detailed feedback for an attempt
   * @param {string} attemptId - Attempt ID
   * @returns {Promise} Detailed feedback
   */
  getFeedback: async (attemptId) => {
    const response = await api.get(`/speech/feedback/${attemptId}`);
    return response.data;
  },

  /**
   * Get speech statistics
   * @param {Object} options - Filter options
   * @returns {Promise} Statistics data
   */
  getStats: async (options = {}) => {
    const response = await api.get('/speech/stats', { params: options });
    return response.data;
  },

  /**
   * Compare user pronunciation with reference
   * @param {Blob} audioBlob - User audio
   * @param {string} flashcardId - Flashcard ID
   * @returns {Promise} Comparison result
   */
  comparePronunciation: async (audioBlob, flashcardId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await api.post(`/speech/compare/${flashcardId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default speechService;