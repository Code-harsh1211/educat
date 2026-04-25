import axios from 'axios';

const api = axios.create({
  baseURL: 'https://educat-1-jmer.onrender.com/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Courses ─────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  togglePublish: (id) => api.put(`/courses/${id}/publish`),
  getTeacherCourses: () => api.get('/courses/teacher/my-courses'),
  getTeacherStats: () => api.get('/courses/teacher/stats'),
  getCourseStudents: (id) => api.get(`/courses/${id}/students`),
};

// ─── Lectures ────────────────────────────────────────────────────────────────
export const lectureAPI = {
  getForCourse: (courseId) => api.get(`/lectures/course/${courseId}`),
  getOne: (id) => api.get(`/lectures/${id}`),
  create: (courseId, data) => api.post(`/lectures/course/${courseId}`, data),
  update: (id, data) => api.put(`/lectures/${id}`, data),
  delete: (id) => api.delete(`/lectures/${id}`),
  markComplete: (id) => api.put(`/lectures/${id}/complete`),
};

// ─── Enrollments ─────────────────────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => api.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  unenroll: (courseId) => api.delete(`/enrollments/${courseId}`),
};

// ─── Comments ────────────────────────────────────────────────────────────────
export const commentAPI = {
  getForLecture: (lectureId) => api.get(`/comments/lecture/${lectureId}`),
  add: (lectureId, data) => api.post(`/comments/lecture/${lectureId}`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/all/read'),
};

// ─── Announcements ───────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  delete: (id) => api.delete(`/announcements/${id}`),
};
