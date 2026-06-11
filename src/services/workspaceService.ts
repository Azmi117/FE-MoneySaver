// src/services/workspaceService.ts
import api from './api';

export const workspaceService = {
  getWorkspaces: async () => {
    // Nembak GET /api/v1/workspaces
    const response = await api.get('/workspaces');
    return response.data;
  },

  getSummary: async (workspaceId: number, period?: string) => {
    // Tambahin query parameter biar backend tau periode mana yang mau diambil
    const url = period 
      ? `/workspaces/${workspaceId}/summary?period=${period}` 
      : `/workspaces/${workspaceId}/summary`;
    
    const response = await api.get(url);
    return response.data;
  },

  getMembers: async (workspaceId: number) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  getPendingInvitations: async () => {
    const response = await api.get('/workspaces/invitations/pending');
    return response.data;
  },
  createWorkspace: async (data: any) => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },
  updateWorkspace: async (id: number, data: any) => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data;
  },
  deleteWorkspace: async (id: number) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  },
  setTarget: async (data: any) => {
    const response = await api.post('/workspaces/target', data);
    return response.data;
  },
  inviteMember: async (id: number, email: string) => {
    const response = await api.post(`/workspaces/${id}/invite`, { email });
    return response.data;
  },
  acceptInvitation: async (id: number) => {
    const response = await api.post(`/workspaces/invitations/${id}/accept`);
    return response.data;
  },
  rejectInvitation: async (id: number) => {
    const response = await api.post(`/workspaces/invitations/${id}/reject`);
    return response.data;
  }
};