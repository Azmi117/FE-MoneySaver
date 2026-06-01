// src/store/useWorkspaceStore.ts
import { create } from 'zustand';

// Sesuaikan interface ini dengan JSON response dari struct Workspace Golang lu
export interface Workspace {
  id?: number;
  ID?: number;
  name: string;
  type?: string; 
  owner_id?: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));