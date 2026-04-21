import {
  ChoiceOption,
  SceneNode,
  StoryCharacter,
  StoryDocument,
  StoryScene,
  VnVariable,
} from '@/types/StoryDocument'
import {
  TuesdayBlockPlacement,
  TuesdayChoice,
  TuesdayCharacterDefinition,
  TuesdayDialog,
  TuesdayLegacyChoiceRule,
  TuesdayLocalizedPath,
  TuesdayLocalizedText,
  TuesdayProjectJson,
  TuesdayScene,
  TuesdayVariableMutation,
  TuesdayVariableValue,
} from '@/types/TuesdayProjectJson'

const DEFAULT_LANGUAGE = 'en'

export function deserializeTuesdayProject(project: TuesdayProjectJson): StoryDocument {
  const language: string = project.parameters.languares[0] ?? DEFAULT_LANGUAGE
  const now: string = new Date().toISOString()
  const sceneIdsByBlockId: Record<string, string[]> = buildSceneIdsByBlockId(project)

  return {
    meta: {
      name: readLocalizedText(project.parameters.title, language) ?? 'Untitled Project',
      version: '0.1.0',
      tuesdayJs: '59.0.0',
      created: now,
      modified: now,
    },
    parameters: {
      language,
      resolution: [
        project.parameters.resolutions?.[0] ?? 640,
        project.parameters.resolutions?.[1] ?? 480,
      ],
      font: project.parameters.font ?? 'Arial',
      textSpeed: Number(project.parameters.text_panel.dialog_speed ?? 10),
    },
    variables: deserializeVariables(project.parameters.variables),
    characters: deserializeCharacters(project.parameters.characters, language),
    scenes: deserializeScenes(project, language, sceneIdsByBlockId),
  }
}

function buildSceneIdsByBlockId(project: TuesdayProjectJson): Record<string, string[]> {
  const sceneIdsByBlockId: Record<string, string[]> = {}

  Object.keys(project.blocks).forEach(blockId => {
    const blockScenes: TuesdayScene[] = Array.isArray(project[blockId]) ? ((project[blockId] as TuesdayScene[]) ?? []) : []
    sceneIdsByBlockId[blockId] = blockScenes.map((_, sceneIndex) => {
      return sceneIndex === 0 ? blockId : `${blockId}__scene_${sceneIndex + 1}`
    })
  })

  return sceneIdsByBlockId
}

function deserializeVariables(
  variables: Record<string, TuesdayVariableValue> | undefined,
): VnVariable[] {
  if (!variables) {
    return []
  }

  return Object.entries(variables).map(([name, defaultValue]) => ({
    name,
    type: getVariableType(defaultValue),
    defaultValue: defaultValue ?? '',
  }))
}

function deserializeCharacters(
  characters: Record<string, TuesdayCharacterDefinition> | undefined,
  language: string,
): StoryCharacter[] {
  if (!characters) {
    return []
  }

  return Object.entries(characters).map(([id, character]) => ({
    id,
    name: readLocalizedText(character, language) ?? id,
    color: character.color ?? '',
    sprites: createSpriteMap(character.art, language),
  }))
}

function createSpriteMap(
  art: TuesdayLocalizedPath | undefined,
  language: string,
): Record<string, string> {
  const path: string | undefined = readLocalizedPath(art, language)

  if (!path) {
    return {}
  }

  return {default: path}
}

function deserializeScenes(
  project: TuesdayProjectJson,
  language: string,
  sceneIdsByBlockId: Record<string, string[]>,
): StoryScene[] {
  const scenes: StoryScene[] = []

  Object.entries(project.blocks).forEach(([blockId, placement]) => {
    const blockScenes: TuesdayScene[] = Array.isArray(project[blockId]) ? ((project[blockId] as TuesdayScene[]) ?? []) : []

    blockScenes.forEach((scene, sceneIndex) => {
      const sceneId: string = sceneIdsByBlockId[blockId]?.[sceneIndex] ?? blockId

      scenes.push({
        id: sceneId,
        label: sceneId,
        background: readLocalizedPath(scene.background_image, language) ?? null,
        music: typeof scene.background_music === 'string' ? scene.background_music : null,
        nodes: deserializeDialogs(blockId, scene, sceneIndex, sceneIdsByBlockId, language),
        position: readPlacementPosition(placement),
        source: {
          blockId,
          sceneIndex,
        },
      })
    })
  })

  return scenes
}

function deserializeDialogs(
  blockId: string,
  scene: TuesdayScene,
  sceneIndex: number,
  sceneIdsByBlockId: Record<string, string[]>,
  language: string,
): SceneNode[] {
  const nodes: SceneNode[] = []

  scene.dialogs.forEach(dialog => {
    nodes.push(...deserializeDialog(blockId, dialog, sceneIndex, sceneIdsByBlockId, language))
  })

  return nodes
}

function deserializeDialog(
  blockId: string,
  dialog: TuesdayDialog,
  sceneIndex: number,
  sceneIdsByBlockId: Record<string, string[]>,
  language: string,
): SceneNode[] {
  const nodes: SceneNode[] = []
  const text: string | undefined = readLocalizedText(dialog.text, language)
  const textAdd: string | undefined = readLocalizedText(dialog.text_add, language)

  if (text) {
    nodes.push({
      type: 'dialogue',
      speaker: typeof dialog.name === 'string' ? dialog.name : '',
      text,
    })
  }

  if (textAdd) {
    nodes.push({
      type: 'dialogue',
      speaker: typeof dialog.name === 'string' ? dialog.name : '',
      text: textAdd,
    })
  }

  if (dialog.choice?.length) {
    nodes.push({
      type: 'choice',
      options: dialog.choice.map(choice =>
        deserializeChoice(choice, blockId, sceneIndex, sceneIdsByBlockId, language),
      ),
    })
  }

  if (dialog.go_to) {
    nodes.push({
      type: 'jump',
      target: mapGoToTarget(dialog.go_to, blockId, sceneIndex, sceneIdsByBlockId),
    })
  }

  if (dialog.variables?.length) {
    nodes.push(...dialog.variables.map(variable => deserializeVariableMutation(variable)))
  }

  if (dialog.legacy_choice?.length) {
    nodes.push(
      ...deserializeLegacyChoice(dialog.legacy_choice, blockId, sceneIndex, sceneIdsByBlockId),
    )
  }

  if (dialog.sound) {
    const file: string | undefined = readLocalizedPath(dialog.sound, language)

    if (file) {
      nodes.push({type: 'sfx', file})
    }
  }

  if (dialog.timer) {
    nodes.push({type: 'wait', duration: dialog.timer[0]})

    if (dialog.timer[1] !== 'tue_go' && dialog.timer[1] !== 'tue_update_scene') {
      nodes.push({
        type: 'jump',
        target: mapGoToTarget(dialog.timer[1], blockId, sceneIndex, sceneIdsByBlockId),
      })
    }
  }

  if (dialog.js) {
    nodes.push({type: 'codeBlock', luauSource: `-- Tuesday.js inline JavaScript\n${dialog.js}`})
  }

  if (dialog.video) {
    nodes.push({
      type: 'codeBlock',
      luauSource: `-- Unsupported Tuesday.js video dialog preserved for manual migration\n-- ${JSON.stringify(dialog.video)}`,
    })
  }

  if (dialog.art?.length) {
    nodes.push({
      type: 'codeBlock',
      luauSource: `-- Unsupported Tuesday.js art dialog preserved for manual migration\n-- ${JSON.stringify(dialog.art)}`,
    })
  }

  if (dialog.html) {
    nodes.push({
      type: 'codeBlock',
      luauSource: `-- Unsupported Tuesday.js html dialog preserved for manual migration\n-- ${JSON.stringify(dialog.html)}`,
    })
  }

  return nodes
}

function deserializeChoice(
  choice: TuesdayChoice,
  blockId: string,
  sceneIndex: number,
  sceneIdsByBlockId: Record<string, string[]>,
  language: string,
): ChoiceOption {
  return {
    text: readLocalizedText(choice.text, language) ?? 'Choice',
    jump: mapGoToTarget(choice.go_to ?? 'tue_go', blockId, sceneIndex, sceneIdsByBlockId),
  }
}

function deserializeVariableMutation(variable: TuesdayVariableMutation): SceneNode {
  return {
    type: 'set',
    variable: variable[0],
    operation: variable[1],
    value: String(variable[2] ?? ''),
  }
}

function deserializeLegacyChoice(
  legacyChoice: TuesdayLegacyChoiceRule[],
  blockId: string,
  sceneIndex: number,
  sceneIdsByBlockId: Record<string, string[]>,
): SceneNode[] {
  const condition = legacyChoice.find(rule => Array.isArray(rule)) as
    | [string, '=' | '>' | '<', TuesdayVariableValue, string]
    | undefined
  const fallback = legacyChoice.find(
    rule => !Array.isArray(rule) && typeof rule.go_to === 'string',
  ) as {go_to?: string} | undefined

  if (!condition) {
    return [
      {
        type: 'codeBlock',
        luauSource: `-- Unsupported Tuesday.js legacy_choice preserved for manual migration\n-- ${JSON.stringify(legacyChoice)}`,
      },
    ]
  }

  return [
    {
      type: 'condition',
      variable: condition[0],
      op: mapLegacyOperator(condition[1]),
      value: String(condition[2] ?? ''),
      trueBranch: mapGoToTarget(condition[3], blockId, sceneIndex, sceneIdsByBlockId),
      falseBranch: mapGoToTarget(fallback?.go_to ?? 'tue_go', blockId, sceneIndex, sceneIdsByBlockId),
    },
  ]
}

function mapLegacyOperator(operator: '=' | '>' | '<'): '==' | '>' | '<' {
  if (operator === '=') {
    return '=='
  }

  return operator
}

function mapGoToTarget(
  goTo: string,
  blockId: string,
  sceneIndex: number,
  sceneIdsByBlockId: Record<string, string[]>,
): string {
  if (goTo === 'tue_go') {
    return sceneIdsByBlockId[blockId]?.[sceneIndex + 1] ?? 'NEXT'
  }

  if (goTo.startsWith('tue_')) {
    return goTo
  }

  return sceneIdsByBlockId[goTo]?.[0] ?? goTo
}

function readPlacementPosition(placement: TuesdayBlockPlacement): {x: number; y: number} {
  return {
    x: readNumericValue(placement[0]),
    y: readNumericValue(placement[1]),
  }
}

function readNumericValue(value: string | number): number {
  if (typeof value === 'number') {
    return value
  }

  const parsed: number = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getVariableType(value: TuesdayVariableValue): VnVariable['type'] {
  if (typeof value === 'boolean') {
    return 'bool'
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'float'
  }

  return 'string'
}

function readLocalizedText(
  value: TuesdayLocalizedText | TuesdayCharacterDefinition | undefined,
  language: string,
): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (!value || typeof value !== 'object') {
    return undefined
  }

  const localizedValue: unknown = value[language] ?? value[DEFAULT_LANGUAGE]

  if (typeof localizedValue === 'string' || typeof localizedValue === 'number') {
    return String(localizedValue)
  }

  const firstScalarValue: unknown = Object.values(value).find(
    item => typeof item === 'string' || typeof item === 'number',
  )

  if (typeof firstScalarValue === 'string' || typeof firstScalarValue === 'number') {
    return String(firstScalarValue)
  }

  return undefined
}

function readLocalizedPath(
  value: TuesdayLocalizedPath | string | number | undefined,
  language: string,
): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value[language] ?? value[DEFAULT_LANGUAGE] ?? Object.values(value)[0]
}
