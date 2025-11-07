// frontend/src/services/shopService.js
import api from '../utils/api';

export const shopService = {
  getItems: async (type) => {
    const params = type ? { type } : {};
    const response = await api.get('/shop/items', { params });
    return response.data;
  },
  
  purchase: async (itemId) => {
    const response = await api.post('/shop/purchase', { itemId });
    return response.data;
  },
  
  useItem: async (inventoryId) => {
    const response = await api.post('/shop/use', { inventoryId });
    return response.data;
  },
  
  getInventory: async (type) => {
    const params = type ? { type } : {};
    const response = await api.get('/shop/inventory', { params });
    return response.data;
  },
  getGems: async () => {
    try {
      const response = await api.get('/shop/gems');
      console.log('Gems Response:', response.data);
      
      return {
        success: true,
        gems: response.data.gems || 0
      };
    } catch (error) {
      console.error('Error fetching gems:', error);
      return {
        success: false,
        gems: 0
      };
    }
  }
};