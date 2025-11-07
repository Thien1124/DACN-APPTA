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

export const noteTypeService = {
  // Get all note types
  getNoteTypes: async () => {
    const response = await axiosInstance.get('/note-types');
    return response.data;
  },

  // Get note type by ID
  getNoteType: async (id) => {
    const response = await axiosInstance.get(`/note-types/${id}`);
    return response.data;
  },

  // Create note type
  createNoteType: async (noteTypeData) => {
    const response = await axiosInstance.post('/note-types', noteTypeData);
    return response.data;
  },

  // Update note type
  updateNoteType: async (id, noteTypeData) => {
    const response = await axiosInstance.put(`/note-types/${id}`, noteTypeData);
    return response.data;
  },

  // Delete note type
  deleteNoteType: async (id) => {
    const response = await axiosInstance.delete(`/note-types/${id}`);
    return response.data;
  },
};

export default noteTypeService;