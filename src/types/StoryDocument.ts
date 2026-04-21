export interface StoryDocument {
  meta: ProjectMeta
  parameters: StoryParameters
  variables: VnVariable[]
  characters: StoryCharacter[]
  scenes: StoryScene[]
  assets: ProjectAsset[]
  volumes: StoryVolume[]
  chapters: StoryChapter[]
  builtInAssets: BuiltInVectorAssetCatalog
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
  orientation: OrientationMode
  font: string
  textSpeed: number
  builtInUi: BuiltInUiSkin
}

export type OrientationMode = 'portrait' | 'landscape' | 'adaptive'
export type ChoiceStyle = 'pill' | 'card' | 'glass'
export type SettingsStyle = 'sheet' | 'sidebar'
export type MotionPreset = 'standard' | 'reduced'
export type ChatFrameStyle = 'petal' | 'paper' | 'glass'
export type AssetCategory =
  | 'background'
  | 'sprite'
  | 'music'
  | 'sfx'
  | 'video'
  | 'ui'
  | 'misc'

export interface BuiltInUiSkin {
  chatPadding: number
  choiceStyle: ChoiceStyle
  settingsStyle: SettingsStyle
  safeAreaEnabled: boolean
  motionPreset: MotionPreset
  chatFrameStyle: ChatFrameStyle
}

export interface ProjectAsset {
  id: string
  name: string
  category: AssetCategory
  path: string
  sizeBytes: number
  importedAt: string
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
  position: GraphPosition
  source: StorySceneSource
}

export interface StorySceneSource {
  blockId: string
  sceneIndex: number
}

export interface StoryVolume {
  id: string
  name: string
  description: string
  chapterIds: string[]
  graph: VolumeGraph
}

export interface StoryChapter {
  id: string
  volumeId: string
  name: string
  summary: string
  sceneIds: string[]
  graph: ChapterGraph
  timelineLanes: TimelineLane[]
  luau: string
  tuesdayCoverage: TuesdayCoverage
}

export interface TuesdayCoverage {
  supported: number
  preserved: number
}

export interface VolumeGraph {
  nodes: VolumeGraphNode[]
  edges: GraphEdge[]
}

export interface VolumeGraphNode {
  id: string
  chapterId: string
  label: string
  position: GraphPosition
}

export interface ChapterGraph {
  nodes: ChapterGraphNode[]
  edges: GraphEdge[]
}

export interface ChapterGraphNode {
  id: string
  type: ChapterGraphNodeType
  title: string
  lane: TimelineLaneId
  position: GraphPosition
  sceneId?: string
  payload: ChapterGraphPayload
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  branchKey?: string
}

export interface GraphPosition {
  x: number
  y: number
}

export type TimelineLaneId = 'story' | 'media' | 'logic'

export interface TimelineLane {
  id: TimelineLaneId
  title: string
  description: string
}

export type ChapterGraphNodeType =
  | 'start'
  | 'dialogue'
  | 'choice'
  | 'condition'
  | 'jump'
  | 'background'
  | 'music'
  | 'sfx'
  | 'set'
  | 'wait'
  | 'code'

export interface ChapterGraphPayload {
  speaker?: string
  text?: string
  options?: ChoiceOption[]
  variable?: string
  op?: Op
  value?: string
  trueBranch?: string
  falseBranch?: string
  target?: string
  image?: string
  file?: string
  loop?: boolean
  volume?: number
  duration?: number
  operation?: SetOp
  luauSource?: string
}

export interface BuiltInVectorAssetCatalog {
  version: string
  tokens: BuiltInVectorTokens
  assets: BuiltInVectorAsset[]
}

export interface BuiltInVectorTokens {
  background: string
  surface: string
  border: string
  accent: string
  accentSoft: string
  text: string
  radius: number
  chatPadding: number
}

export interface BuiltInVectorAsset {
  id: 'chat-frame' | 'choice-pill' | 'choice-card' | 'settings-shell'
  title: string
  kind: 'chat' | 'choice' | 'settings'
  variant: string
  svg: string
}

export type SceneNode =
  | {type: 'dialogue'; speaker: string; text: string; sprite?: string}
  | {type: 'choice'; options: ChoiceOption[]}
  | {type: 'jump'; target: string}
  | {
      type: 'condition'
      variable: string
      op: Op
      value: string
      trueBranch: string
      falseBranch: string
    }
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

const DEFAULT_TIMELINE_LANES: TimelineLane[] = [
  {
    id: 'story',
    title: 'Story lane',
    description: 'Dialogue, branching, route beats, and chapter flow.',
  },
  {
    id: 'media',
    title: 'Media lane',
    description: 'Backgrounds, music, SFX, sprites, and cinematic cues.',
  },
  {
    id: 'logic',
    title: 'Logic lane',
    description: 'Conditions, variables, timers, Luau hooks, and state.',
  },
]

function createSvgData({
  width,
  height,
  path,
  accentPath,
  tokens,
}: {
  width: number
  height: number
  path: string
  accentPath?: string
  tokens: BuiltInVectorTokens
}): string {
  const accentMarkup: string = accentPath
    ? `<path d="${accentPath}" fill="${tokens.accentSoft}" stroke="${tokens.accent}" stroke-width="2"/>`
    : ''

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">`,
    `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="${tokens.radius}" fill="${tokens.surface}" stroke="${tokens.border}" stroke-width="2"/>`,
    accentMarkup,
    `<path d="${path}" fill="${tokens.surface}" stroke="${tokens.border}" stroke-width="2"/>`,
    '</svg>',
  ].join('')
}

export function createDefaultBuiltInUiSkin(): BuiltInUiSkin {
  return {
    chatPadding: 20,
    choiceStyle: 'pill',
    settingsStyle: 'sheet',
    safeAreaEnabled: true,
    motionPreset: 'standard',
    chatFrameStyle: 'petal',
  }
}

export function createBuiltInVectorCatalog(
  builtInUi: BuiltInUiSkin = createDefaultBuiltInUiSkin(),
): BuiltInVectorAssetCatalog {
  const tokens: BuiltInVectorTokens = {
    background: '#F9EFF2',
    surface: '#FFF9FB',
    border: '#E6C7D0',
    accent: '#B65072',
    accentSoft: '#F5D9E1',
    text: '#4B2B36',
    radius: builtInUi.choiceStyle === 'card' ? 28 : 22,
    chatPadding: builtInUi.chatPadding,
  }

  return {
    version: '1.0.0',
    tokens,
    assets: [
      {
        id: 'chat-frame',
        title: 'Dialogue frame',
        kind: 'chat',
        variant: builtInUi.chatFrameStyle,
        svg: createSvgData({
          width: 640,
          height: 220,
          tokens,
          path:
            builtInUi.chatFrameStyle === 'glass'
              ? 'M22 30H618C624 30 630 36 630 42V182C630 188 624 194 618 194H138L98 214L103 194H22C16 194 10 188 10 182V42C10 36 16 30 22 30Z'
              : 'M24 26H616C624 26 630 32 630 40V184C630 192 624 198 616 198H162L110 214L118 198H24C16 198 10 192 10 184V40C10 32 16 26 24 26Z',
          accentPath:
            builtInUi.chatFrameStyle === 'petal'
              ? 'M30 42H140C166 42 187 63 187 89V92H30Z'
              : 'M472 34H606C616 34 624 42 624 52V82H472Z',
        }),
      },
      {
        id: 'choice-pill',
        title: 'Choice button',
        kind: 'choice',
        variant: builtInUi.choiceStyle,
        svg: createSvgData({
          width: 520,
          height: 120,
          tokens,
          path:
            builtInUi.choiceStyle === 'glass'
              ? 'M60 18H460C489 18 512 41 512 70C512 99 489 102 460 102H60C31 102 8 99 8 70C8 41 31 18 60 18Z'
              : builtInUi.choiceStyle === 'card'
                ? 'M22 10H498C507 10 514 17 514 26V94C514 103 507 110 498 110H22C13 110 6 103 6 94V26C6 17 13 10 22 10Z'
                : 'M50 20H470C493 20 512 39 512 62V70C512 93 493 100 470 100H50C27 100 8 93 8 70V62C8 39 27 20 50 20Z',
          accentPath: 'M30 38H156C168 38 178 48 178 60C178 72 168 82 156 82H30Z',
        }),
      },
      {
        id: 'choice-card',
        title: 'Branch card',
        kind: 'choice',
        variant: 'card',
        svg: createSvgData({
          width: 520,
          height: 156,
          tokens,
          path: 'M24 12H496C507 12 516 21 516 32V124C516 135 507 144 496 144H24C13 144 4 135 4 124V32C4 21 13 12 24 12Z',
          accentPath: 'M26 26H210C222 26 232 36 232 48V70H26Z',
        }),
      },
      {
        id: 'settings-shell',
        title: 'Settings sheet',
        kind: 'settings',
        variant: builtInUi.settingsStyle,
        svg: createSvgData({
          width: 620,
          height: 420,
          tokens,
          path:
            builtInUi.settingsStyle === 'sidebar'
              ? 'M22 8H598C610 8 620 18 620 30V390C620 402 610 412 598 412H22C10 412 0 402 0 390V30C0 18 10 8 22 8Z'
              : 'M22 24H598C610 24 620 34 620 46V396C620 408 610 418 598 418H22C10 418 0 408 0 396V46C0 34 10 24 22 24Z',
          accentPath:
            builtInUi.settingsStyle === 'sidebar'
              ? 'M30 26H198C210 26 220 36 220 48V394H30Z'
              : 'M34 38H586C598 38 608 48 608 60V124H34Z',
        }),
      },
    ],
  }
}

export function countSceneNodes(document: StoryDocument): number {
  return document.scenes.reduce((sum, scene) => sum + scene.nodes.length, 0)
}

export function createEmptyStoryDocument(projectName = 'Untitled Project'): StoryDocument {
  const now: string = new Date().toISOString()
  const parameters: StoryParameters = {
    language: 'en',
    resolution: [720, 1280],
    orientation: 'portrait',
    font: 'Georgia',
    textSpeed: 10,
    builtInUi: createDefaultBuiltInUiSkin(),
  }
  const baseDocument: StoryDocument = {
    meta: {
      name: projectName,
      version: '0.1.0',
      tuesdayJs: '59.0.0',
      created: now,
      modified: now,
    },
    parameters,
    variables: [],
    characters: [],
    scenes: [],
    assets: [],
    volumes: [],
    chapters: [],
    builtInAssets: createBuiltInVectorCatalog(parameters.builtInUi),
  }

  return ensureStoryDocumentShape(baseDocument)
}

function createDefaultVolume(projectName: string): StoryVolume {
  return {
    id: 'volume-1',
    name: 'Volume 1',
    description: `${projectName} main route graph.`,
    chapterIds: [],
    graph: {
      nodes: [],
      edges: [],
    },
  }
}

function inferNodeType(node: SceneNode): ChapterGraphNodeType {
  switch (node.type) {
    case 'dialogue':
      return 'dialogue'
    case 'choice':
      return 'choice'
    case 'condition':
      return 'condition'
    case 'jump':
      return 'jump'
    case 'background':
      return 'background'
    case 'music':
      return 'music'
    case 'sfx':
      return 'sfx'
    case 'set':
      return 'set'
    case 'wait':
      return 'wait'
    case 'codeBlock':
      return 'code'
    default:
      return 'dialogue'
  }
}

function inferLane(node: SceneNode): TimelineLaneId {
  switch (node.type) {
    case 'background':
    case 'music':
    case 'sfx':
    case 'showChar':
    case 'hideChar':
    case 'effect':
      return 'media'
    case 'condition':
    case 'set':
    case 'wait':
    case 'codeBlock':
      return 'logic'
    default:
      return 'story'
  }
}

function sceneNodeToGraphPayload(node: SceneNode): ChapterGraphPayload {
  switch (node.type) {
    case 'dialogue':
      return {speaker: node.speaker, text: node.text}
    case 'choice':
      return {options: node.options}
    case 'condition':
      return {
        variable: node.variable,
        op: node.op,
        value: node.value,
        trueBranch: node.trueBranch,
        falseBranch: node.falseBranch,
      }
    case 'jump':
      return {target: node.target}
    case 'background':
      return {image: node.image}
    case 'music':
      return {file: node.file, loop: node.loop, volume: node.volume}
    case 'sfx':
      return {file: node.file}
    case 'set':
      return {variable: node.variable, value: node.value, operation: node.operation}
    case 'wait':
      return {duration: node.duration}
    case 'codeBlock':
      return {luauSource: node.luauSource}
    default:
      return {}
  }
}

function inferCoverage(sceneIds: string[], scenes: StoryScene[]): TuesdayCoverage {
  let supported = 0
  let preserved = 0

  scenes
    .filter(scene => sceneIds.includes(scene.id))
    .forEach(scene => {
      scene.nodes.forEach(node => {
        if (node.type === 'codeBlock') {
          preserved += 1
          return
        }

        supported += 1
      })
    })

  return {supported, preserved}
}

export function deriveVolumeAndChapters(
  scenes: StoryScene[],
  projectName: string,
): Pick<StoryDocument, 'volumes' | 'chapters'> {
  const volume: StoryVolume = createDefaultVolume(projectName)
  const blockIds: string[] = Array.from(new Set(scenes.map(scene => scene.source.blockId)))
  const chapters: StoryChapter[] = blockIds.map((blockId, chapterIndex) => {
    const chapterScenes: StoryScene[] = scenes.filter(scene => scene.source.blockId === blockId)
    const graphNodes: ChapterGraphNode[] = [
      {
        id: `${blockId}__start`,
        type: 'start',
        title: 'Start',
        lane: 'story',
        position: {x: 48, y: 84},
        sceneId: chapterScenes[0]?.id,
        payload: {},
      },
    ]
    const graphEdges: GraphEdge[] = []
    let previousNodeId: string = `${blockId}__start`

    chapterScenes.forEach((scene, sceneIndex) => {
      scene.nodes.forEach((node, nodeIndex) => {
        const graphNodeId: string = `${scene.id}__node_${nodeIndex + 1}`
        const lane: TimelineLaneId = inferLane(node)
        const laneY: number = lane === 'story' ? 72 : lane === 'media' ? 224 : 376
        graphNodes.push({
          id: graphNodeId,
          type: inferNodeType(node),
          title:
            node.type === 'dialogue'
              ? node.speaker || 'Dialogue'
              : node.type === 'choice'
                ? 'Choice'
                : node.type === 'condition'
                  ? `If ${node.variable}`
                  : node.type === 'background'
                    ? 'Background'
                    : node.type === 'music'
                      ? 'Music'
                      : node.type === 'set'
                        ? `${node.operation} ${node.variable}`
                        : node.type === 'wait'
                          ? `Wait ${node.duration}ms`
                          : node.type === 'jump'
                            ? `Jump ${node.target}`
                            : node.type === 'sfx'
                              ? 'SFX'
                              : 'Code',
          lane,
          position: {
            x: 188 + nodeIndex * 188,
            y: laneY + sceneIndex * 36,
          },
          sceneId: scene.id,
          payload: sceneNodeToGraphPayload(node),
        })
        graphEdges.push({
          id: `${previousNodeId}__${graphNodeId}`,
          source: previousNodeId,
          target: graphNodeId,
        })
        previousNodeId = graphNodeId
      })
    })

    const chapterId: string = blockId
    volume.chapterIds.push(chapterId)
    volume.graph.nodes.push({
      id: `${chapterId}__volume`,
      chapterId,
      label: chapterScenes[0]?.label ?? blockId,
      position: {x: 100 + chapterIndex * 220, y: 120 + (chapterIndex % 2) * 110},
    })

    if (chapterIndex > 0) {
      const previousChapterId: string = blockIds[chapterIndex - 1]
      volume.graph.edges.push({
        id: `${previousChapterId}__to__${chapterId}`,
        source: `${previousChapterId}__volume`,
        target: `${chapterId}__volume`,
      })
    }

    return {
      id: chapterId,
      volumeId: volume.id,
      name: chapterScenes[0]?.label ?? `Chapter ${chapterIndex + 1}`,
      summary:
        chapterScenes[0]?.nodes.find((node): node is Extract<SceneNode, {type: 'dialogue'}> => node.type === 'dialogue')
          ?.text ?? 'Branching chapter graph.',
      sceneIds: chapterScenes.map(scene => scene.id),
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
      },
      timelineLanes: DEFAULT_TIMELINE_LANES,
      luau: `-- ${chapterScenes[0]?.label ?? blockId}\n-- Custom logic hooks for this chapter live here.\nlocal state = {}\n\nreturn state`,
      tuesdayCoverage: inferCoverage(chapterScenes.map(scene => scene.id), scenes),
    }
  })

  return {
    volumes: [volume],
    chapters,
  }
}

export function ensureStoryDocumentShape(document: StoryDocument): StoryDocument {
  const builtInUi: BuiltInUiSkin = {
    ...createDefaultBuiltInUiSkin(),
    ...(document.parameters?.builtInUi ?? {}),
  }
  const derivedCollections = deriveVolumeAndChapters(
    document.scenes ?? [],
    document.meta?.name ?? 'Untitled Project',
  )

  return {
    ...document,
    parameters: {
      ...document.parameters,
      builtInUi,
    },
    scenes: document.scenes ?? [],
    assets: document.assets ?? [],
    volumes: document.volumes?.length ? document.volumes : derivedCollections.volumes,
    chapters: document.chapters?.length ? document.chapters : derivedCollections.chapters,
    builtInAssets: createBuiltInVectorCatalog(builtInUi),
  }
}

export function createStarterStoryDocument(projectName = 'Moonlit Demo'): StoryDocument {
  const document: StoryDocument = createEmptyStoryDocument(projectName)

  document.characters = [
    {
      id: 'yuna',
      name: 'Yuna',
      color: '#C15D7D',
      sprites: {},
    },
    {
      id: 'kai',
      name: 'Kai',
      color: '#6C5B7B',
      sprites: {},
    },
  ]

  document.variables = [
    {name: 'trust', type: 'int', defaultValue: 0},
    {name: 'route', type: 'string', defaultValue: 'common'},
  ]

  document.scenes = [
    {
      id: 'opening',
      label: 'Opening',
      background: null,
      music: null,
      position: {x: 180, y: 120},
      source: {blockId: 'chapter-1', sceneIndex: 0},
      nodes: [
        {type: 'background', image: 'builtin://backgrounds/moonlit-city'},
        {type: 'music', file: 'builtin://music/quiet-night', loop: true, volume: 0.65},
        {type: 'dialogue', speaker: 'yuna', text: 'The festival lights are almost gone.'},
        {
          type: 'dialogue',
          speaker: 'kai',
          text: 'Then let us build a story before the morning finds us.',
        },
        {
          type: 'choice',
          options: [
            {text: 'Stay on the rooftop', jump: 'rooftop'},
            {text: 'Go back to the studio', jump: 'studio'},
          ],
        },
      ],
    },
    {
      id: 'rooftop',
      label: 'Rooftop Route',
      background: null,
      music: null,
      position: {x: 480, y: 200},
      source: {blockId: 'chapter-2a', sceneIndex: 0},
      nodes: [
        {
          type: 'dialogue',
          speaker: 'yuna',
          text: 'This route should feel vertical, intimate, and quiet.',
        },
        {type: 'set', variable: 'trust', value: '1', operation: 'add'},
        {
          type: 'codeBlock',
          luauSource:
            '-- Example branch hook\nif story.trust and story.trust > 0 then\n  story.route = "rooftop"\nend',
        },
      ],
    },
    {
      id: 'studio',
      label: 'Studio Route',
      background: null,
      music: null,
      position: {x: 480, y: 380},
      source: {blockId: 'chapter-2b', sceneIndex: 0},
      nodes: [
        {
          type: 'dialogue',
          speaker: 'kai',
          text: 'This route needs tools, previews, and a clean workspace.',
        },
        {type: 'set', variable: 'route', value: 'studio', operation: 'set'},
        {type: 'wait', duration: 800},
      ],
    },
  ]

  return ensureStoryDocumentShape(document)
}
