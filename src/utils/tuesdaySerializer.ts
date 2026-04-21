import {
  BuiltInUiSkin,
  ChoiceOption,
  SceneNode,
  StoryDocument,
  StoryScene,
} from '@/types/StoryDocument'
import {
  TuesdayBlockPlacement,
  TuesdayChoice,
  TuesdayDialog,
  TuesdayLegacyChoiceRule,
  TuesdayProjectJson,
  TuesdayScene,
  TuesdayVariableMutation,
  TuesdayVariableValue,
} from '@/types/TuesdayProjectJson'

const DEFAULT_BACKGROUND_COLOR = '#11141c'
const DEFAULT_MOE_SKIN: BuiltInUiSkin = {
  chatPadding: 20,
  choiceStyle: 'pill',
  settingsStyle: 'sheet',
  safeAreaEnabled: true,
  motionPreset: 'standard',
  chatFrameStyle: 'petal',
}

export function serializeStoryDocument(document: StoryDocument): TuesdayProjectJson {
  const blocks: TuesdayProjectJson['blocks'] = {}
  const blockEntries: Record<string, TuesdayScene[]> = {}
  const scenesByBlockId: Record<string, StoryScene[]> = {}
  const scenesById: Record<string, StoryScene> = Object.fromEntries(
    document.scenes.map(scene => [scene.id, scene]),
  )

  document.scenes.forEach(scene => {
    const blockId: string = scene.source.blockId || scene.id
    const existingScenes: StoryScene[] = scenesByBlockId[blockId] ?? []
    scenesByBlockId[blockId] = [...existingScenes, scene]
  })

  Object.entries(scenesByBlockId).forEach(([blockId, scenes]) => {
    const orderedScenes: StoryScene[] = [...scenes].sort((left, right) => {
      return left.source.sceneIndex - right.source.sceneIndex
    })

    blocks[blockId] = createBlockPlacement(orderedScenes[0])
    blockEntries[blockId] = orderedScenes.map(scene => serializeScene(scene, scenesById))
  })

  return {
    parameters: {
      text_panel: {
        size: ['95%', '25%'],
        color: '#171b26',
        color_text: '#f3f5f7',
        indent_text: '12px',
        indent_bottom: '32px',
        size_text: `${Math.max(document.parameters.textSpeed + 8, 14)}px`,
        dialog_speed: String(document.parameters.textSpeed),
        position: ['0', '0', '0'],
        font_family: document.parameters.font,
      },
      name_panel: {
        size: ['222px', '48px'],
        position: ['0', '0', '-48px', '0'],
        indent_text: '8px',
        size_text: '18px',
        color_text: '#f3f5f7',
        align: ['flex-start', 'center'],
      },
      title: document.meta.name,
      launch_story: document.scenes[0]?.source.blockId ?? document.scenes[0]?.id ?? 'start',
      key: {},
      languares: [document.parameters.language],
      buttons: [],
      style_file: '',
      autosave: false,
      font: document.parameters.font,
      font_size: '18px',
      variables: Object.fromEntries(
        document.variables.map(variable => [variable.name, serializeVariableValue(variable.defaultValue)]),
      ),
      sounds: {},
      characters: Object.fromEntries(
        document.characters.map(character => [
          character.id,
          {
            [document.parameters.language]: character.name,
            color: character.color,
            art: character.sprites.default ?? '',
          },
        ]),
      ),
      plugins: [],
      icon: '',
      font_files: {},
      resolutions: [
        document.parameters.resolution[0],
        document.parameters.resolution[1],
        DEFAULT_BACKGROUND_COLOR,
        '',
      ],
      moe: {
        orientation: document.parameters.orientation,
        builtInUi: document.parameters.builtInUi ?? DEFAULT_MOE_SKIN,
        assets: document.assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          category: asset.category,
          path: asset.path,
          sizeBytes: asset.sizeBytes,
          importedAt: asset.importedAt,
        })),
        volumes: document.volumes.map(volume => ({
          id: volume.id,
          name: volume.name,
          chapterIds: volume.chapterIds,
        })),
        chapters: document.chapters.map(chapter => ({
          id: chapter.id,
          volumeId: chapter.volumeId,
          name: chapter.name,
          sceneIds: chapter.sceneIds,
          coverage: chapter.tuesdayCoverage,
        })),
      },
    },
    blocks,
    ...blockEntries,
  }
}

function serializeScene(
  scene: StoryScene,
  scenesById: Record<string, StoryScene>,
): TuesdayScene {
  const dialogs: TuesdayDialog[] = []

  scene.nodes.forEach(node => {
    dialogs.push(...serializeNode(node, scene, scenesById))
  })

  return {
    dialogs,
    background_color: DEFAULT_BACKGROUND_COLOR,
    background_image: scene.background ?? undefined,
    background_music: scene.music ?? undefined,
  }
}

function serializeNode(
  node: SceneNode,
  scene: StoryScene,
  scenesById: Record<string, StoryScene>,
): TuesdayDialog[] {
  switch (node.type) {
    case 'dialogue':
      return [
        {
          text: node.text,
          name: node.speaker || undefined,
        },
      ]
    case 'choice':
      return [
        {
          choice: node.options.map(option => serializeChoiceOption(option, scene, scenesById)),
        },
      ]
    case 'jump':
      return [{go_to: mapStoryTargetToTuesdayTarget(node.target, scene, scenesById)}]
    case 'condition':
      return [
        {
          legacy_choice: serializeLegacyChoice(node, scene, scenesById),
        },
      ]
    case 'set':
      if (node.operation === 'set' || node.operation === 'add') {
        return [{variables: [serializeVariableMutation(node.variable, node.operation, node.value)]}]
      }

      return [
        {
          js: `/* Unsupported normalized variable mutation preserved for manual migration */ story_json.parameters.variables.${node.variable} = '${escapeForJs(`${node.operation}:${node.value}`)}';`,
        },
      ]
    case 'music':
      return [{js: `tue_bg_music.src='${escapeForJs(node.file)}';tue_bg_music.loop=${node.loop ? 'true' : 'false'};tue_bg_music.volume=${node.volume};`}]
    case 'sfx':
      return [{sound: node.file}]
    case 'wait':
      return [{timer: [node.duration, 'tue_go']}]
    case 'background':
      return [
        {
          js: `tuesday.style.backgroundImage="url('${escapeForJs(node.image)}')";`,
        },
      ]
    case 'showChar':
    case 'hideChar':
    case 'effect':
    case 'codeBlock':
      return [{js: wrapCodeBlock(node)}]
    default:
      return []
  }
}

function serializeChoiceOption(
  option: ChoiceOption,
  scene: StoryScene,
  scenesById: Record<string, StoryScene>,
): TuesdayChoice {
  return {
    go_to: mapStoryTargetToTuesdayTarget(option.jump, scene, scenesById),
    position: ['0', '0', '0', '0'],
    size: [0, null],
    color: '#171b26',
    color_text: '#f3f5f7',
    text: option.text,
    indent_text: '8px',
    hotspot: ['0%', '0%'],
  }
}

function serializeLegacyChoice(
  node: Extract<SceneNode, {type: 'condition'}>,
  scene: StoryScene,
  scenesById: Record<string, StoryScene>,
): TuesdayLegacyChoiceRule[] {
  return [
    [
      node.variable,
      mapConditionOperator(node.op),
      node.value,
      mapStoryTargetToTuesdayTarget(node.trueBranch, scene, scenesById),
    ],
    {go_to: mapStoryTargetToTuesdayTarget(node.falseBranch, scene, scenesById)},
  ]
}

function serializeVariableMutation(
  variable: string,
  operation: 'set' | 'add' | 'sub' | 'mul' | 'div',
  value: string,
): TuesdayVariableMutation {
  if (operation === 'set' || operation === 'add') {
    return [variable, operation, parseScalar(value)]
  }

  return [variable, 'set', `${operation}:${value}`]
}

function mapConditionOperator(operator: '==' | '!=' | '>' | '<' | '>=' | '<='): '=' | '>' | '<' {
  if (operator === '>' || operator === '>=') {
    return '>'
  }

  if (operator === '<' || operator === '<=') {
    return '<'
  }

  return '='
}

function mapStoryTargetToTuesdayTarget(
  target: string,
  currentScene: StoryScene,
  scenesById: Record<string, StoryScene>,
): string {
  if (target === 'NEXT') {
    return 'tue_go'
  }

  if (target === currentScene.id) {
    return 'tue_go'
  }

  const targetScene: StoryScene | undefined = scenesById[target]

  if (
    targetScene &&
    targetScene.source.blockId === currentScene.source.blockId &&
    targetScene.source.sceneIndex === currentScene.source.sceneIndex + 1
  ) {
    return 'tue_go'
  }

  if (targetScene) {
    return targetScene.source.blockId
  }

  return target
}

function createBlockPlacement(scene: StoryScene): TuesdayBlockPlacement {
  return [`${scene.position.x}px`, `${scene.position.y}px`, 'block', false]
}

function serializeVariableValue(value: string | number | boolean): TuesdayVariableValue {
  return value
}

function parseScalar(value: string): TuesdayVariableValue {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  const numericValue: number = Number(value)

  if (!Number.isNaN(numericValue) && value.trim() !== '') {
    return numericValue
  }

  return value
}

function escapeForJs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function wrapCodeBlock(node: Extract<SceneNode, {type: 'showChar' | 'hideChar' | 'effect' | 'codeBlock'}>): string {
  if (node.type === 'codeBlock') {
    return `/* Moe codeBlock passthrough placeholder */\n${node.luauSource}`
  }

  return `/* Unsupported normalized node preserved for manual migration: ${JSON.stringify(node)} */`
}
