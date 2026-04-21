import {create} from 'zustand'

import {
  AssetCategory,
  createEmptyStoryDocument,
  ensureStoryDocumentShape,
  ProjectAsset,
  StoryChapter,
  StoryDocument,
  StoryParameters,
} from '@/types/StoryDocument'

interface StoryStoreState {
  document: StoryDocument
  setDocument: (document: StoryDocument) => void
  patchDocument: (patch: Partial<StoryDocument>) => void
  patchParameters: (patch: Partial<StoryParameters>) => void
  renameProject: (name: string) => void
  setAssets: (assets: ProjectAsset[]) => void
  addAsset: (asset: ProjectAsset) => void
  removeAssetsByCategory: (category: AssetCategory) => void
  updateChapter: (chapterId: string, updater: (chapter: StoryChapter) => StoryChapter) => void
}

export const useStoryStore = create<StoryStoreState>(set => ({
  document: ensureStoryDocumentShape(createEmptyStoryDocument()),
  setDocument: document => set({document: ensureStoryDocumentShape(document)}),
  patchDocument: patch =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        ...patch,
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
          ...(patch.meta ?? {}),
        },
      }),
    })),
  patchParameters: patch =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        parameters: {
          ...state.document.parameters,
          ...patch,
          builtInUi: {
            ...state.document.parameters.builtInUi,
            ...(patch.builtInUi ?? {}),
          },
        },
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
        },
      }),
    })),
  renameProject: name =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        meta: {
          ...state.document.meta,
          name,
          modified: new Date().toISOString(),
        },
      }),
    })),
  setAssets: assets =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        assets,
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
        },
      }),
    })),
  addAsset: asset =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        assets: [asset, ...state.document.assets.filter(item => item.id !== asset.id)],
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
        },
      }),
    })),
  removeAssetsByCategory: category =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        assets: state.document.assets.filter(asset => asset.category !== category),
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
        },
      }),
    })),
  updateChapter: (chapterId, updater) =>
    set(state => ({
      document: ensureStoryDocumentShape({
        ...state.document,
        chapters: state.document.chapters.map(chapter =>
          chapter.id === chapterId ? updater(chapter) : chapter,
        ),
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
        },
      }),
    })),
}))
