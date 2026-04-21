import {deserializeTuesdayProject} from '@/utils/tuesdayDeserializer'
import {serializeStoryDocument} from '@/utils/tuesdaySerializer'
import {TuesdayBlockScene, TuesdayProjectJson, TuesdayScene} from '@/types/TuesdayProjectJson'

const fixture: TuesdayProjectJson = require('./fixtures/minimal-dialogue.json')
const multiSceneFixture: TuesdayProjectJson = require('./fixtures/multi-scene-block.json')

function readBlockScenes(
  project: TuesdayProjectJson,
  blockId: string,
): TuesdayScene[] {
  const blockValue: TuesdayProjectJson[string] = project[blockId]

  if (!Array.isArray(blockValue)) {
    return []
  }

  return blockValue.filter(
    (value: TuesdayBlockScene[number] | string): value is TuesdayScene =>
      Boolean(value && typeof value === 'object' && 'dialogs' in value),
  )
}

describe('Tuesday transforms', () => {
  test('deserializes a minimal Tuesday project into StoryDocument', () => {
    const document = deserializeTuesdayProject(fixture)

    expect(document.meta.name).toBe('Fixture Novel')
    expect(document.variables).toEqual([
      {
        name: 'score',
        type: 'int',
        defaultValue: 1,
      },
    ])
    expect(document.characters[0]).toEqual({
      id: 'hero',
      name: 'Hero',
      color: '#ffffff',
      sprites: {
        default: 'characters/hero.png',
      },
    })
    expect(document.scenes[0].id).toBe('intro')
    expect(document.scenes[0].background).toBe('backgrounds/start.png')
    expect(document.scenes[0].music).toBe('music/theme.mp3')
    expect(document.scenes[0].nodes).toEqual([
      {
        type: 'dialogue',
        speaker: 'hero',
        text: 'Hello there',
      },
      {
        type: 'set',
        variable: 'score',
        operation: 'add',
        value: '2',
      },
      {
        type: 'jump',
        target: 'ending',
      },
    ])
    expect(document.scenes[0].source).toEqual({
      blockId: 'intro',
      sceneIndex: 0,
    })
  })

  test('serializes the normalized document back into Tuesday blocks', () => {
    const document = deserializeTuesdayProject(fixture)
    const project = serializeStoryDocument(document)
    const introScenes = readBlockScenes(project, 'intro')

    expect(project.parameters.launch_story).toBe('intro')
    expect(project.blocks.intro).toEqual(['100px', '200px', 'block', false])
    expect(introScenes[0]?.dialogs[0]).toEqual({
      text: 'Hello there',
      name: 'hero',
    })
    expect(introScenes[0]?.dialogs[1]).toEqual({
      variables: [['score', 'add', 2]],
    })
    expect(introScenes[0]?.dialogs[2]).toEqual({
      go_to: 'ending',
    })
  })

  test('preserves multi-scene Tuesday blocks through normalization', () => {
    const document = deserializeTuesdayProject(multiSceneFixture)

    expect(document.scenes).toHaveLength(2)
    expect(document.scenes[0]).toMatchObject({
      id: 'chapter_1',
      background: 'backgrounds/scene-one.png',
      source: {
        blockId: 'chapter_1',
        sceneIndex: 0,
      },
    })
    expect(document.scenes[1]).toMatchObject({
      id: 'chapter_1__scene_2',
      background: 'backgrounds/scene-two.png',
      source: {
        blockId: 'chapter_1',
        sceneIndex: 1,
      },
    })
    expect(document.scenes[0].nodes[1]).toEqual({
      type: 'jump',
      target: 'chapter_1__scene_2',
    })

    const project = serializeStoryDocument(document)
    const chapterScenes = readBlockScenes(project, 'chapter_1')

    expect(project.blocks.chapter_1).toEqual(['300px', '120px', 'block', false])
    expect(chapterScenes).toHaveLength(2)
    expect(chapterScenes[0]?.dialogs[1]).toEqual({
      go_to: 'tue_go',
    })
    expect(chapterScenes[1]?.dialogs[0]).toEqual({
      text: 'Scene two line',
      name: undefined,
    })
  })
})
