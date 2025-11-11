import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:1124/api";

// Create axios instance with token interceptor
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  // ========== COURSES ==========
  courses: {
    getAll: async () => {
      const response = await axiosInstance.get("/courses");
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/courses/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/courses", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/courses/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/courses/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await axiosInstance.patch(`/courses/${id}/publish`);
      return response.data;
    },
  },

  // ========== UNITS ==========
  units: {
    getAll: async () => {
      const response = await axiosInstance.get("/units");
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await axiosInstance.get(`/courses/${courseId}/units`);
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/units/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/units", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/units/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/units/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await axiosInstance.patch(`/units/${id}/publish`);
      return response.data;
    },
  },

  // ========== LESSONS ==========
  lessons: {
    getAll: async () => {
      const response = await axiosInstance.get("/lessons");
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await axiosInstance.get(`/units/${unitId}/lessons`);
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/lessons/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/lessons", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/lessons/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/lessons/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await axiosInstance.patch(`/lessons/${id}/publish`);
      return response.data;
    },
  },

  // ========== VOCABULARIES ==========
  vocabularies: {
    getAll: async () => {
      const response = await axiosInstance.get("/vocabularies");
      return response.data;
    },

    getByLesson: async (lessonId) => {
      const response = await axiosInstance.get(
        `/lessons/${lessonId}/vocabularies`
      );
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/vocabularies/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/vocabularies", data);
      return response.data;
    },

    createBulk: async (data) => {
      const response = await axiosInstance.post("/vocabularies/bulk", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/vocabularies/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/vocabularies/${id}`);
      return response.data;
    },

    /**
     * Bulk create vocabulary items
     * @param {Array} vocabularies - Array of vocabulary objects
     * @returns {Promise} API response
     */
    bulkCreate: async (vocabularies) => {
      try {
        const response = await axiosInstance.post('/vocabularies/bulk', vocabularies);
        return response.data;
      } catch (error) {
        console.error('Bulk create vocabularies error:', error);
        throw error;
      }
    },
  },

  // ========== EXERCISES ==========
  exercises: {
    getAll: async () => {
      const response = await axiosInstance.get("/exercises");
      return response.data;
    },

    getByLesson: async (lessonId) => {
      const response = await axiosInstance.get(
        `/lessons/${lessonId}/exercises`
      );
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/exercises/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/exercises", data);
      return response.data;
    },

    createBulk: async (data) => {
      const response = await axiosInstance.post("/exercises/bulk", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/exercises/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/exercises/${id}`);
      return response.data;
    },
    importFromExcel: async (formData) => {
      const response = await axiosInstance.post("/exercises/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },

    downloadTemplate: async () => {
    const response = await axiosInstance.get("/exercises/template", {
      responseType: "blob", 
    });
    return response.data;
  }
  },

  // ========== ACHIEVEMENTS ==========
  achievements: {
    getAll: async () => {
      const response = await axiosInstance.get("/achievements");
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/achievements/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/achievements", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/achievements/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/achievements/${id}`);
      return response.data;
    },

    toggleActive: async (id) => {
      const response = await axiosInstance.patch(
        `/achievements/${id}/toggle-active`
      );
      return response.data;
    },
  },

  // ========== TESTS ==========
  tests: {
    getAll: async () => {
      const response = await axiosInstance.get("/tests");
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await axiosInstance.get(`/tests/course/${courseId}`);
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await axiosInstance.get(`/tests/unit/${unitId}`);
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/tests/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/tests", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/tests/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/tests/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await axiosInstance.patch(`/tests/${id}/publish`);
      return response.data;
    },

    addExercise: async (testId, exerciseId) => {
      const response = await axiosInstance.post(
        `/tests/${testId}/exercises/${exerciseId}`
      );
      return response.data;
    },

    removeExercise: async (testId, exerciseId) => {
      const response = await axiosInstance.delete(
        `/tests/${testId}/exercises/${exerciseId}`
      );
      return response.data;
    },

    // Test attempt endpoints
    start: async (id) => {
      const response = await axiosInstance.post(`/tests/${id}/start`);
      return response.data;
    },

    submitAnswer: async (attemptId, data) => {
      const response = await axiosInstance.post(
        `/tests/attempts/${attemptId}/answer`,
        data
      );
      return response.data;
    },

    complete: async (attemptId) => {
      const response = await axiosInstance.post(
        `/tests/attempts/${attemptId}/complete`
      );
      return response.data;
    },

    getResult: async (attemptId) => {
      const response = await axiosInstance.get(
        `/tests/attempts/${attemptId}/result`
      );
      return response.data;
    },

    getHistory: async () => {
      const response = await axiosInstance.get("/tests/history");
      return response.data;
    },
  },

  // ========== DECKS ==========
  decks: {
    getAll: async () => {
      const response = await axiosInstance.get("/decks");
      return response.data;
    },

    getByCourse: async (courseId) => {
      const response = await axiosInstance.get(`/decks/course/${courseId}`);
      return response.data;
    },

    getByUnit: async (unitId) => {
      const response = await axiosInstance.get(`/decks/unit/${unitId}`);
      return response.data;
    },

    getById: async (id) => {
      const response = await axiosInstance.get(`/decks/${id}`);
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/decks", data);
      return response.data;
    },

    update: async (id, data) => {
      const response = await axiosInstance.put(`/decks/${id}`, data);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/decks/${id}`);
      return response.data;
    },

    togglePublish: async (id) => {
      const response = await axiosInstance.patch(`/decks/${id}/publish`);
      return response.data;
    },
  },

  // ========== LEADERBOARD ==========
  leaderboard: {
    getOverall: async () => {
      const response = await axiosInstance.get("/leaderboard/overall");
      return response.data;
    },

    getWeekly: async () => {
      const response = await axiosInstance.get("/leaderboard/weekly");
      return response.data;
    },

    getMonthly: async () => {
      const response = await axiosInstance.get("/leaderboard/monthly");
      return response.data;
    },

    getUserLeaderboard: async (userId) => {
      const response = await axiosInstance.get(`/leaderboard/user/${userId}`);
      return response.data;
    },

    updateUserXP: async (data) => {
      const response = await axiosInstance.post("/leaderboard/update-xp", data);
      return response.data;
    },

    updateUserStreak: async (data) => {
      const response = await axiosInstance.post(
        "/leaderboard/update-streak",
        data
      );
      return response.data;
    },

    resetWeekly: async () => {
      const response = await axiosInstance.post("/leaderboard/reset-weekly");
      return response.data;
    },

    resetMonthly: async () => {
      const response = await axiosInstance.post("/leaderboard/reset-monthly");
      return response.data;
    },
  },

  // ========== USERS ==========
  users: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.role !== "all" && { role: params.role }),
        ...(params.isActive !== "all" && {
          isActive: params.isActive === "active",
        }),
        ...(params.search && { search: params.search }),
      }).toString();

      const response = await axiosInstance.get(`/users?${queryString}`);
      return response.data;
    },

    toggleActive: async (userId) => {
      const response = await axiosInstance.patch(
        `/users/${userId}/toggle-active`
      );
      return response.data;
    },

    changeRole: async (userId, newRole) => {
      const response = await axiosInstance.patch(
        `/users/${userId}/change-role`,
        { role: newRole }
      );
      return response.data;
    },

    delete: async (userId) => {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data;
    },
  },

  // ========== NOTIFICATIONS ==========
  notifications: {
    getAll: async () => {
      const response = await axiosInstance.get("/notifications");
      return response.data;
    },

    create: async (data) => {
      const response = await axiosInstance.post("/notifications", data);
      return response.data;
    },

    markAsRead: async (id) => {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data;
    },

    delete: async (id) => {
      const response = await axiosInstance.delete(`/notifications/${id}`);
      return response.data;
    },
  },

  // ========== AUDIT LOGS ==========
  auditLogs: {
    getAll: async (params) => {
      const response = await axiosInstance.get("/audit", { params });
      return response.data;
    },

    getStats: async () => {
      const response = await axiosInstance.get("/audit/stats");
      return response.data;
    },

    exportLogs: async () => {
      const response = await axiosInstance.get("/audit/export");
      return response.data;
    },
  },

  // ========== FLASHCARDS (ADMIN) ==========
  flashcards: {
    getAll: async () => {
      try {
        const response = await axiosInstance.get("/flashcards");
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    getById: async (id) => {
      try {
        const response = await axiosInstance.get(`/flashcards/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    create: async (data) => {
      try {
        const response = await axiosInstance.post("/flashcards", {
          front: data.front,
          back: data.back,
          example: data.example,
          imageUrl: data.imageUrl || "",
          audioUrl: data.audioUrl || "",
          deck: data.deck, // ID of the deck
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    update: async (id, data) => {
      try {
        const response = await axiosInstance.put(`/flashcards/${id}`, {
          front: data.front,
          back: data.back,
          example: data.example,
          imageUrl: data.imageUrl || "",
          audioUrl: data.audioUrl || "",
          deck: data.deck,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    delete: async (id) => {
      try {
        const response = await axiosInstance.delete(`/flashcards/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    getByDeck: async (deckId) => {
      try {
        const response = await axiosInstance.get(`/decks/${deckId}/flashcards`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    bulkCreate: async (deckId, flashcards) => {
      try {
        // Change endpoint to /flashcards/bulk instead of /decks/:id/flashcards
        const response = await axiosInstance.post("/flashcards/bulk", {
          deckId,
          flashcards,
        });
        return response.data;
      } catch (error) {
        console.error("Bulk create error:", error);
        throw error;
      }
    },
  },
};

export default adminService;
