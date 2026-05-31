// src/services/authService.ts
import api from './api';

export const authService = {
  // Gunakan header JSON
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data; 
  },

  // Hapus header Content-Type agar Axios otomatis menggunakan multipart/form-data
  register: async (data: any) => {
    const response = await api.post('/auth/register', data, {
      headers: { 'Content-Type': undefined } 
    });
    return response.data;
  },

  // Gunakan header JSON
  verifyLoginOTP: async (data: any) => {
    const response = await api.post('/auth/login/verify', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Gunakan header JSON
  verifyRegisterOTP: async (data: any) => {
    const response = await api.post('/auth/register/verify', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Gunakan header JSON
  resendOTP: async (data: any) => {
    const response = await api.post('/auth/otp/resend', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  forgotPasswordRequest: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (data: any) => { // data = { email, code, new_password }
    const response = await api.post('/auth/forgot-password/verify', data);
    return response.data;
  },

  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google/login');
    return response.data; // Nanti isinya: { data: { url: "https://accounts.google.com/..." } }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data; // Mengambil response dari backend
  },
};