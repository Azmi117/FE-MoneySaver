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
};