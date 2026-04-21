export interface StoryDocument {
  meta: ProjectMeta
  parameters: StoryParameters
  variables: VnVariable[]
  characters: StoryCharacter[]
  scenes: StoryScene[]
}

export interface ProjectMeta {
  name: string
  version: string
  tuesdayJs: string
  created: string
  modified: string
}

export interface StoryParameters {
  language: string
  resolution: [number, number]
  font: string
  textSpeed: number
}

export interface VnVariable {
  name: string
  type: 'int' | 'float' | 'string' | 'bool'
  defaultValue: string | number | boolean
}

export interface StoryCharacter {
  id: string
  name: string
  color: string
  sprites: Record<string, string>
}

export interface StoryScene {
  id: string
  label: string
  background: string | null
  music: string | null
  nodes: SceneNode[]
  position: {
    x: number
    y: number
  }
  source: StorySceneSource
}

export interface StorySceneSource {
  blockId: string
  sceneIndex: number
}

export type SceneNode =
  | {type: 'dialogue'; speaker: string; text: string; sprite?: string}
  | {type: 'choice'; options: ChoiceOption[]}
  | {type: 'jump'; target: string}
  | {type: 'condition'; variable: string; op: Op; value: string; trueBranch: string; falseBranch: string}
  | {type: 'set'; variable: string; value: string; operation: SetOp}
  | {type: 'showChar'; character: string; sprite: string; position: Position}
  | {type: 'hideChar'; character: string}
  | {type: 'background'; image: string; transition?: string}
  | {type: 'music'; file: string; loop: boolean; volume: number}
  | {type: 'sfx'; file: string}
  | {type: 'effect'; name: string; params: Record<string, string>}
  | {type: 'wait'; duration: number}
  | {type: 'codeBlock'; luauSource: string}

export type Op = '==' | '!=' | '>' | '<' | '>=' | '<='
export type SetOp = 'set' | 'add' | 'sub' | 'mul' | 'div'
export type Position = 'far_left' | 'left' | 'center' | 'right' | 'far_right'

export interface ChoiceOption {
  text: string
  jump: string
  condition?: {
    variable: string
    op: Op
    value: string
  }
}
