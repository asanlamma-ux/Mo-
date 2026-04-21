import {create} from 'zustand'

import {StoragePermissionState} from '@/services/storagePermissions'

export interface RecentProject {
  name: string
  path: string
  modifiedAt: string
}

export interface ExportRecord {
  format: string
  path: string
  createdAt: string
}

interface ProjectStoreState {
  activeProjectPath: string | null
  workspaceRoot: string | null
  workspaceDirectoryUri: string | null
  permissionState: StoragePermissionState
  recentProjects: RecentProject[]
  exportHistory: ExportRecord[]
  setActiveProjectPath: (path: string | null) => void
  setWorkspaceRoot: (path: string | null) => void
  setWorkspaceDirectoryUri: (uri: string | null) => void
  setPermissionState: (permissionState: StoragePermissionState) => void
  setRecentProjects: (projects: RecentProject[]) => void
  addRecentProject: (project: RecentProject) => void
  addExportRecord: (record: ExportRecord) => void
}

export const useProjectStore = create<ProjectStoreState>(set => ({
  activeProjectPath: null,
  workspaceRoot: null,
  workspaceDirectoryUri: null,
  permissionState: 'unknown',
  recentProjects: [],
  exportHistory: [],
  setActiveProjectPath: activeProjectPath => set({activeProjectPath}),
  setWorkspaceRoot: workspaceRoot => set({workspaceRoot}),
  setWorkspaceDirectoryUri: workspaceDirectoryUri => set({workspaceDirectoryUri}),
  setPermissionState: permissionState => set({permissionState}),
  setRecentProjects: recentProjects => set({recentProjects}),
  addRecentProject: project =>
    set(state => ({
      recentProjects: [project, ...state.recentProjects.filter(item => item.path !== project.path)].slice(0, 12),
    })),
  addExportRecord: record =>
    set(state => ({
      exportHistory: [record, ...state.exportHistory].slice(0, 12),
    })),
}))
