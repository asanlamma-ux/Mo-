import {create} from 'zustand'

export type EditorMode = 'overview' | 'graph' | 'assets' | 'logic' | 'preview' | 'code'

interface EditorStoreState {
  mode: EditorMode
  selectedVolumeId: string | null
  selectedChapterId: string | null
  selectedGraphNodeId: string | null
  isConnectingNodes: boolean
  setMode: (mode: EditorMode) => void
  setSelectedVolumeId: (volumeId: string | null) => void
  setSelectedChapterId: (chapterId: string | null) => void
  setSelectedGraphNodeId: (nodeId: string | null) => void
  setIsConnectingNodes: (isConnecting: boolean) => void
}

export const useEditorStore = create<EditorStoreState>(set => ({
  mode: 'graph',
  selectedVolumeId: null,
  selectedChapterId: null,
  selectedGraphNodeId: null,
  isConnectingNodes: false,
  setMode: mode => set({mode}),
  setSelectedVolumeId: selectedVolumeId => set({selectedVolumeId}),
  setSelectedChapterId: selectedChapterId => set({selectedChapterId}),
  setSelectedGraphNodeId: selectedGraphNodeId => set({selectedGraphNodeId}),
  setIsConnectingNodes: isConnectingNodes => set({isConnectingNodes}),
}))
