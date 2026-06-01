// src/services/workspaceService.ts
import api from './api';

export const workspaceService = {
  getWorkspaces: async () => {
    // Nembak GET /api/v1/workspaces
    const response = await api.get('/workspaces');
    return response.data;
  },
  getSummary: async (workspaceId: number) => {
    const response = await api.get(`/workspaces/${workspaceId}/summary`);
    return response.data;
  }
};