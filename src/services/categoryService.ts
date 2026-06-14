import api from './api';

export const categoryService = {
  getByWorkspace: async (workspaceId: number) => {
    const response = await api.get(`/workspaces/${workspaceId}/categories`);
    return response.data;
  },
  create: async (workspaceId: number, data: any) => {
    const response = await api.post(`/workspaces/${workspaceId}/categories`, data);
    return response.data;
  }
};