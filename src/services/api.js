import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 60000; // Increased to 60 seconds for AI operations

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: (data) => apiClient.post('/auth/logout', data),
  refreshToken: (data) => apiClient.post('/auth/refresh', data)
};

// Users API
export const usersAPI = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (userData) => apiClient.put('/users/me', userData),
  getUserById: (userId) => apiClient.get(`/users/${userId}`),
  deleteAccount: () => apiClient.delete('/users/me')
};

// Career API
export const careerAPI = {
  createOrUpdateProfile: (profileData) => apiClient.post('/career/profile', profileData),
  analyzeSkillGap: (data) => apiClient.post('/career/analyze', data, { timeout: 60000 }),
  generateRoadmap: (data) => apiClient.post('/career/roadmap', data, { timeout: 120000 }), // 2 minutes for roadmap
  getDashboard: () => apiClient.get('/career/dashboard'),
  getJobRoles: () => apiClient.get('/career/job-roles'),
  uploadResume: (formData) => apiClient.post('/career/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  })
};

// Courses API
export const coursesAPI = {
  listCourses: (params) => apiClient.get('/courses', { params }),
  getCourseById: (courseId) => apiClient.get(`/courses/${courseId}`),
  createCourse: (courseData) => apiClient.post('/courses', courseData),
  updateCourse: (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData),
  deleteCourse: (courseId) => apiClient.delete(`/courses/${courseId}`),
  getCourseLessons: (courseId) => apiClient.get(`/courses/${courseId}/lessons`)
};

// Lessons API
export const lessonsAPI = {
  getLessonById: (lessonId) => apiClient.get(`/lessons/${lessonId}`),
  createLesson: (lessonData) => apiClient.post('/lessons', lessonData),
  updateLesson: (lessonId, lessonData) => apiClient.put(`/lessons/${lessonId}`, lessonData),
  deleteLesson: (lessonId) => apiClient.delete(`/lessons/${lessonId}`),
  markLessonComplete: (lessonId) => apiClient.post(`/lessons/${lessonId}/complete`),
  getTranscript: (lessonId) => apiClient.get(`/lessons/${lessonId}/transcript`),
  saveTranscript: (lessonId, data) => apiClient.post(`/lessons/${lessonId}/transcript`, data),
  fetchYouTubeTranscript: (lessonId, language = 'en') => apiClient.post(`/lessons/${lessonId}/transcript/fetch-youtube`, { language }),
  deleteTranscript: (lessonId) => apiClient.delete(`/lessons/${lessonId}/transcript`),
  analyzeTranscript: (lessonId, transcript) => apiClient.post(`/lessons/${lessonId}/analyze-transcript`, 
    { transcript }, 
    { timeout: 120000 } // 2 minutes for AI analysis
  ),
  analyzeTranscriptDemo: (transcript) => apiClient.post('/lessons/analyze-transcript-demo',
    { transcript },
    { timeout: 120000 } // 2 minutes for AI analysis
  )
};

// Enrollments API
export const enrollmentsAPI = {
  enrollInCourse: (data) => apiClient.post('/enrollments', data),
  getUserEnrollments: (params) => apiClient.get('/enrollments', { params }),
  getEnrollmentById: (enrollmentId) => apiClient.get(`/enrollments/${enrollmentId}`),
  unenrollFromCourse: (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`)
};

// Certificates API
export const certificatesAPI = {
  getUserCertificates: () => apiClient.get('/certificates'),
  getCertificateById: (certificateId) => apiClient.get(`/certificates/${certificateId}`),
  verifyCertificate: (certificateId) => apiClient.get(`/certificates/${certificateId}/verify`),
  downloadCertificate: (certificateId) => `${API_BASE_URL}/certificates/${certificateId}/download`
};

// Creators API
export const creatorsAPI = {
  applyAsCreator: (applicationData) => apiClient.post('/creators/apply', applicationData),
  getMyApplication: () => apiClient.get('/creators/application'),
  getCreatorDashboard: () => apiClient.get('/creators/dashboard'),
  getCreatorCourses: () => apiClient.get('/creators/courses'),
  getCreatorAnalytics: (params) => apiClient.get('/creators/analytics', { params })
};

// Admin API
export const adminAPI = {
  listCreatorApplications: (params) => apiClient.get('/admin/applications', { params }),
  reviewApplication: (applicationId, data) => apiClient.put(`/admin/applications/${applicationId}`, data),
  getPlatformAnalytics: (params) => apiClient.get('/admin/analytics', { params }),
  listUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserRole: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  getSkillDemandAnalytics: (params) => apiClient.get('/admin/skill-demand', { params })
};

export default apiClient;
