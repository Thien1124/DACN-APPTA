import api from '../utils/api';

export const unitService = {
  // Lấy lessons của unit
  getLessons: async (unitId) => {
    const response = await api.get(`/units/${unitId}/lessons`);
    return response.data;
  }
};

export default unitService;