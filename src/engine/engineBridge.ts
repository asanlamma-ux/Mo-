import {TuesdayEvent} from '@/engine/TuesdayPreview'

export interface EngineBridge {
  load: (storyJson: string) => void
  jumpTo: (sceneId: string) => void
  setVariable: (name: string, value: string | number | boolean) => void
  setLocale: (language: string) => void
}

export function parseEngineEvent(payload: string): TuesdayEvent {
  return JSON.parse(payload) as TuesdayEvent
}

