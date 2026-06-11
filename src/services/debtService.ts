import api from './api';

export const debtService = {
  getWorkspaceDebts: async (workspaceId: number) => {
    const response = await api.get(`/workspaces/${workspaceId}/debts`);
    return response.data;
  },
  payDebt: async (id: number) => {
    const response = await api.patch(`/debts/${id}/pay`);
    return response.data;
  }
};