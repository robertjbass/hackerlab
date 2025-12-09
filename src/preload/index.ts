import { contextBridge, ipcRenderer } from 'electron'

export type BlockConfig = {
  id: string
  file: string
  type: string
  isSandboxed: boolean
  order: number
}

export type Block = BlockConfig & {
  content: string
}

export type ProjectConfig = {
  name: string
  blocks: BlockConfig[]
  createdAt: string
  updatedAt: string
}

export type Project = Omit<ProjectConfig, 'blocks'> & {
  blocks: Block[]
}

export type HackerlabApi = {
  getProjects: () => Promise<ProjectConfig[]>
  createProject: (name: string) => Promise<{ success: boolean; error?: string }>
  loadProject: (
    name: string,
  ) => Promise<{ success: boolean; project?: Project; error?: string }>
  saveBlock: (
    projectName: string,
    blockId: string,
    content: string,
  ) => Promise<{ success: boolean; error?: string }>
  addBlock: (
    projectName: string,
    blockType: string,
  ) => Promise<{ success: boolean; block?: Block; error?: string }>
  deleteBlock: (
    projectName: string,
    blockId: string,
  ) => Promise<{ success: boolean; error?: string }>
  updateBlock: (
    projectName: string,
    blockId: string,
    updates: { file?: string; type?: string },
  ) => Promise<{ success: boolean; error?: string }>
  reorderBlocks: (
    projectName: string,
    blockIds: string[],
  ) => Promise<{ success: boolean; error?: string }>
  getAppDir: () => Promise<string>
}

const api: HackerlabApi = {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (name: string) => ipcRenderer.invoke('create-project', name),
  loadProject: (name: string) => ipcRenderer.invoke('load-project', name),
  saveBlock: (projectName: string, blockId: string, content: string) =>
    ipcRenderer.invoke('save-block', projectName, blockId, content),
  addBlock: (projectName: string, blockType: string) =>
    ipcRenderer.invoke('add-block', projectName, blockType),
  deleteBlock: (projectName: string, blockId: string) =>
    ipcRenderer.invoke('delete-block', projectName, blockId),
  updateBlock: (
    projectName: string,
    blockId: string,
    updates: { file?: string; type?: string },
  ) => ipcRenderer.invoke('update-block', projectName, blockId, updates),
  reorderBlocks: (projectName: string, blockIds: string[]) =>
    ipcRenderer.invoke('reorder-blocks', projectName, blockIds),
  getAppDir: () => ipcRenderer.invoke('get-app-dir'),
}

contextBridge.exposeInMainWorld('hackerlab', api)

declare global {
  interface Window {
    hackerlab: HackerlabApi
  }
}
