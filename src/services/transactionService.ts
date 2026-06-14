// src/services/transactionService.ts
import api from './api';

export const transactionService = {
  // Nangkep pagination parameter sesuai design handler backend lu
  getHistory: async (workspaceId: number, page: number = 1, limit: number = 10) => {
    // Nembak GET /api/v1/workspaces/{id}/transactions
    const response = await api.get(`/workspaces/${workspaceId}/transactions`, {
      params: { page, limit }
    });
    return response.data;
  },

  splitBill: async (data: any) => {
    const response = await api.post(`/transactions/split`, data);
    return response.data;
  },

  createManual: async (data: any) => {
    const response = await api.post('/transactions/manual', data);
    return response.data;
  },
  deleteTransaction: async (id: number) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  scanHybrid: async (workspaceId: number, formData: FormData) => {
    const response = await api.post(`/transactions/scan-hybrid2`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { workspace_id: workspaceId }
    });
    return response.data;
  },
  scanAlt: async (workspaceId: number, formData: FormData) => {
    const response = await api.post(`/transactions/scan-alt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { workspace_id: workspaceId }
    });
    return response.data;
  },
  confirmHybrid: async (pendingId: number, data: any) => {
    const response = await api.patch(`/transactions/${pendingId}/confirm`, data);
    return response.data;
  },
  confirmAlt: async (data: any) => {
    const response = await api.post(`/transactions/scan-alt/confirm`, data);
    return response.data;
  },
  exportTransactions: async (workspaceId: number, month?: string) => {
    const url = month 
      ? `/workspaces/${workspaceId}/transactions/export?month=${month}` 
      : `/workspaces/${workspaceId}/transactions/export`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  }
};