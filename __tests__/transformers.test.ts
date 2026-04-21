import {deserializeTuesdayProject} from '@/utils/tuesdayDeserializer'
import {serializeStoryDocument} from '@/utils/tuesdaySerializer'

const fixture = require('./fixtures/minimal-dialogue.json')
const multiSceneFixture = require('./fixtures/multi-scene-block.json')

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

    expect(project.parameters.launch_story).toBe('intro')
    expect(project.blocks.intro).toEqual(['100px', '200px', 'block', false])
    expect(project.intro?.[0].dialogs[0]).toEqual({
      text: 'Hello there',
      name: 'hero',
    })
    expect(project.intro?.[0].dialogs[1]).toEqual({
      variables: [['score', 'add', 2]],
    })
    expect(project.intro?.[0].dialogs[2]).toEqual({
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

    expect(project.blocks.chapter_1).toEqual(['300px', '120px', 'block', false])
    expect(project.chapter_1).toHaveLength(2)
    expect(project.chapter_1?.[0].dialogs[1]).toEqual({
      go_to: 'tue_go',
    })
    expect(project.chapter_1?.[1].dialogs[0]).toEqual({
      text: 'Scene two line',
      name: undefined,
    })
  })
})
