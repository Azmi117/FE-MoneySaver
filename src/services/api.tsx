import axios from 'axios';

const api = axios.create({
  baseURL: 'https://be-money-saver.velto.id/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚀 LOGIC BARU (ANTI DEADLOCK): 
    // Kalau yang error 401 adalah request ke /auth/refresh itu sendiri, langsung reject aja!
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Cek kalau error 401 dan bukan request ke login/refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // Cek posisi URL sekarang biar gak infinite loop redirect
        const currentPath = window.location.pathname;
        const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'].includes(currentPath);
        
        if (!isAuthPage) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;