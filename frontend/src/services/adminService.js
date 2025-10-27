import api from '../utils/api';

export const adminService = {
  // ========== COURSES ==========
  courses: {
    getAll: async () => {
      const response = await api.get('/courses');
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/courses', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/courses/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await api.patch(`/courses/${id}/publish`);
      return response.data;
    }
  },

  // ========== UNITS ==========
  units: {
    getAll: async () => {
      const response = await api.get('/units');
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await api.get(`/courses/${courseId}/units`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/units/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/units', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/units/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/units/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await api.patch(`/units/${id}/publish`);
      return response.data;
    }
  },

  // ========== LESSONS ==========
  lessons: {
    getAll: async () => {
      const response = await api.get('/lessons');
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await api.get(`/units/${unitId}/lessons`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/lessons/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/lessons', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/lessons/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/lessons/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await api.patch(`/lessons/${id}/publish`);
      return response.data;
    }
  },

  // ========== VOCABULARIES ==========
  vocabularies: {
    getAll: async () => {
      const response = await api.get('/vocabularies');
      return response.data;
    },

    getByLesson: async (lessonId) => {
      const response = await api.get(`/lessons/${lessonId}/vocabularies`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/vocabularies/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/vocabularies', data);
      return response.data;
    },

    createBulk: async (data) => {
      const response = await api.post('/vocabularies/bulk', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/vocabularies/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/vocabularies/${id}`);
      return response.data;
    }
  },

  // ========== EXERCISES ==========
  exercises: {
    getAll: async () => {
      const response = await api.get('/exercises');
      return response.data;
    },

    getByLesson: async (lessonId) => {
      const response = await api.get(`/lessons/${lessonId}/exercises`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/exercises/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/exercises', data);
      return response.data;
    },

    createBulk: async (data) => {
      const response = await api.post('/exercises/bulk', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/exercises/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/exercises/${id}`);
      return response.data;
    }
  },

  // ========== ACHIEVEMENTS ==========
  achievements: {
    getAll: async () => {
      const response = await api.get('/achievements');
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/achievements/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/achievements', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/achievements/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/achievements/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await api.patch(`/achievements/${id}/toggle-active`);
      return response.data;
    }
  },

  // ========== TESTS ==========
  tests: {
    getAll: async () => {
      const response = await api.get('/tests');
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await api.get(`/tests/course/${courseId}`);
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await api.get(`/tests/unit/${unitId}`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/tests/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/tests', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/tests/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/tests/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await api.patch(`/tests/${id}/publish`);
      return response.data;
    },

    addExercise: async (testId, exerciseId) => {
      const response = await api.post(`/tests/${testId}/exercises/${exerciseId}`);
      return response.data;
    },

    removeExercise: async (testId, exerciseId) => {
      const response = await api.delete(`/tests/${testId}/exercises/${exerciseId}`);
      return response.data;
    },

    // Test attempt endpoints
    start: async (id) => {
      const response = await api.post(`/tests/${id}/start`);
      return response.data;
    },

    submitAnswer: async (attemptId, data) => {
      const response = await api.post(`/tests/attempts/${attemptId}/answer`, data);
      return response.data;
    },

    complete: async (attemptId) => {
      const response = await api.post(`/tests/attempts/${attemptId}/complete`);
      return response.data;
    },

    getResult: async (attemptId) => {
      const response = await api.get(`/tests/attempts/${attemptId}/result`);
      return response.data;
    },

    getHistory: async () => {
      const response = await api.get('/tests/history');
      return response.data;
    }
  },

  // ========== DECKS ==========
  decks: {
    getAll: async () => {
      const response = await api.get('/decks');
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await api.get(`/decks/course/${courseId}`);
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await api.get(`/decks/unit/${unitId}`);
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(`/decks/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/decks', data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await api.put(`/decks/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/decks/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await api.patch(`/decks/${id}/publish`);
      return response.data;
    }
  },


  // ========== LEADERBOARD ==========
  leaderboard: {
    getOverall: async () => {
      const response = await api.get('/leaderboard/overall');
      return response.data;
    },

    getWeekly: async () => {
      const response = await api.get('/leaderboard/weekly');
      return response.data;
    },

    getMonthly: async () => {
      const response = await api.get('/leaderboard/monthly');
      return response.data;
    },

    getUserLeaderboard: async (userId) => {
      const response = await api.get(`/leaderboard/user/${userId}`);
      return response.data;
    },

    updateUserXP: async (data) => {
      const response = await api.post('/leaderboard/update-xp', data);
      return response.data;
    },

    updateUserStreak: async (data) => {
      const response = await api.post('/leaderboard/update-streak', data);
      return response.data;
    },

    resetWeekly: async () => {
      const response = await api.post('/leaderboard/reset-weekly');
      return response.data;
    },

    resetMonthly: async () => {
      const response = await api.post('/leaderboard/reset-monthly');
      return response.data;
    }
  },

  // ========== USERS ==========
  users: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.role !== 'all' && { role: params.role }),
        ...(params.isActive !== 'all' && { isActive: params.isActive === 'active' }),
        ...(params.search && { search: params.search })
      }).toString();

      const response = await api.get(`/users?${queryString}`);
      return response.data;
    },

    toggleActive: async (userId) => {
      const response = await api.patch(`/users/${userId}/toggle-active`);
      return response.data;
    },

    changeRole: async (userId, newRole) => {
      const response = await api.patch(`/users/${userId}/change-role`, { role: newRole });
      return response.data;
    },

    delete: async (userId) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    }
  },

  // ========== NOTIFICATIONS ==========
  notifications: {
    getAll: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },

    create: async (data) => {
      const response = await api.post('/notifications', data);
      return response.data;
    },

    markAsRead: async (id) => {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    }
  },

  // ========== AUDIT LOGS ==========
  auditLogs: {
    getAll: async (params) => {
      const response = await api.get('/audit', { params });
      return response.data;
    },

    getStats: async () => {
      const response = await api.get('/audit/stats');
      return response.data;
    },

    exportLogs: async () => {
      const response = await api.get('/audit/export');
      return response.data;
    }
  },

  // ========== FLASHCARDS (ADMIN) ==========
  getFlashcards: async () => {
    try {
      const response = await api.get('/admin/flashcards');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get flashcards error:', error);
      throw error;
    }
  }
};

