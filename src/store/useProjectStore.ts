import {create} from 'zustand'

export interface RecentProject {
  name: string
  path: string
  modifiedAt: string
}

interface ProjectStoreState {
  activeProjectPath: string | null
  recentProjects: RecentProject[]
  setActiveProjectPath: (path: string | null) => void
  addRecentProject: (project: RecentProject) => void
}

export const useProjectStore = create<ProjectStoreState>(set => ({
  activeProjectPath: null,
  recentProjects: [],
  setActiveProjectPath: activeProjectPath => set({activeProjectPath}),
  addRecentProject: project =>
    set(state => ({
      recentProjects: [project, ...state.recentProjects.filter(item => item.path !== project.path)].slice(0, 10),
    })),
}))

