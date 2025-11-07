import api from '../utils/api';

export const courseService = {
  // ✅ Lấy tất cả courses published (public - không cần login)
  getPublishedCourses: async () => {
    const response = await api.get('/courses/published');
    return response.data;
  },

  // Lấy courses đã enroll của user (yêu cầu login)
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
  },

  // Lấy units của course
  getUnits: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/units`);
    return response.data;
  },

  // Lấy tất cả courses (Admin)
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Lấy course theo ID (Admin)
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Tạo course mới (Admin)
  create: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Cập nhật course (Admin)
  update: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Xóa course (Admin)
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // Toggle publish status (Admin)
  togglePublish: async (id) => {
    const response = await api.patch(`/courses/${id}/publish`);
    return response.data;
  }
};

export default courseService;