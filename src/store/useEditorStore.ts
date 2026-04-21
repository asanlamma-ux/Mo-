import {create} from 'zustand'

export type EditorMode = 'design' | 'variables' | 'code' | 'preview'

interface EditorStoreState {
  mode: EditorMode
  selectedSceneId: string | null
  setMode: (mode: EditorMode) => void
  setSelectedSceneId: (sceneId: string | null) => void
}

export const useEditorStore = create<EditorStoreState>(set => ({
  mode: 'design',
  selectedSceneId: null,
  setMode: mode => set({mode}),
  setSelectedSceneId: selectedSceneId => set({selectedSceneId}),
}))

