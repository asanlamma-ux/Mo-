import {create} from 'zustand'

import {StoryDocument} from '@/types/StoryDocument'

interface StoryStoreState {
  document: StoryDocument
  setDocument: (document: StoryDocument) => void
  patchDocument: (patch: Partial<StoryDocument>) => void
}

const now = new Date().toISOString()

const initialDocument: StoryDocument = {
  meta: {
    name: 'Untitled Project',
    version: '0.1.0',
    tuesdayJs: '59.0.0',
    created: now,
    modified: now,
  },
  parameters: {
    language: 'en',
    resolution: [640, 480],
    font: 'Arial',
    textSpeed: 10,
  },
  variables: [],
  characters: [],
  scenes: [],
}

export const useStoryStore = create<StoryStoreState>(set => ({
  document: initialDocument,
  setDocument: document => set({document}),
  patchDocument: patch =>
    set(state => ({
      document: {
        ...state.document,
        ...patch,
        meta: {
          ...state.document.meta,
          modified: new Date().toISOString(),
          ...(patch.meta ?? {}),
        },
      },
    })),
}))
