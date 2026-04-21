export type ExportFormat = 'TuesdayWebBundle' | 'JsonOnly' | 'LuauScripts'

export interface ProjectConfig {
  name: string
}

export interface ProjectHandle {
  name: string
  path: string
}

export const VnprojManager = {
  async newProject(config: ProjectConfig): Promise<ProjectHandle> {
    return {name: config.name, path: ''}
  },
  async openProject(path: string): Promise<ProjectHandle> {
    return {name: 'Opened Project', path}
  },
  async saveProject(_project: ProjectHandle): Promise<void> {},
  async exportProject(project: ProjectHandle, format: ExportFormat): Promise<string> {
    return `${project.path}:${format}`
  },
}

