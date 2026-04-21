import React, {useEffect, useMemo} from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {MoeCard} from '@/components/MoeCard'
import {RevealView} from '@/components/RevealView'
import {LuauEditor} from '@/editor/code/LuauEditor'
import {NodeGraphCanvas} from '@/editor/dnd/NodeGraphCanvas'
import {TuesdayPreview} from '@/engine/TuesdayPreview'
import {useEditorStore} from '@/store/useEditorStore'
import {useStoryStore} from '@/store/useStoryStore'
import {
  ChapterGraphNode,
  ChapterGraphNodeType,
  ChoiceOption,
  countSceneNodes,
  GraphEdge,
  GraphPosition,
  StoryChapter,
  StoryVolume,
} from '@/types/StoryDocument'
import {moeTheme} from '@/theme/moeTheme'

function Pill({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.pill,
        active ? styles.pillActive : null,
        pressed ? styles.pressed : null,
      ]}>
      <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>{label}</Text>
    </Pressable>
  )
}

function GraphActionButton({
  label,
  onPress,
  emphasis = false,
}: {
  label: string
  onPress: () => void
  emphasis?: boolean
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.graphActionButton,
        emphasis ? styles.graphActionButtonPrimary : null,
        pressed ? styles.pressed : null,
      ]}>
      <Text
        style={[
          styles.graphActionLabel,
          emphasis ? styles.graphActionLabelPrimary : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  )
}

function buildGraphPayload(type: ChapterGraphNodeType): ChapterGraphNode['payload'] {
  switch (type) {
    case 'dialogue':
      return {speaker: 'Narrator', text: 'New dialogue beat'}
    case 'choice':
      return {
        options: [
          {text: 'Choice A', jump: 'branch-a'},
          {text: 'Choice B', jump: 'branch-b'},
        ] satisfies ChoiceOption[],
      }
    case 'condition':
      return {
        variable: 'flag',
        op: '==',
        value: 'true',
        trueBranch: 'true-route',
        falseBranch: 'false-route',
      }
    case 'jump':
      return {target: 'next-scene'}
    case 'background':
      return {image: 'builtin://backgrounds/new-background'}
    case 'music':
      return {file: 'builtin://music/new-track', loop: true, volume: 0.7}
    case 'sfx':
      return {file: 'builtin://sfx/new-hit'}
    case 'set':
      return {variable: 'counter', operation: 'add', value: '1'}
    case 'wait':
      return {duration: 600}
    case 'code':
      return {luauSource: '-- New chapter hook\nreturn true'}
    default:
      return {}
  }
}

function buildNodeTitle(type: ChapterGraphNodeType): string {
  switch (type) {
    case 'dialogue':
      return 'Dialogue'
    case 'choice':
      return 'Choice'
    case 'condition':
      return 'Condition'
    case 'jump':
      return 'Jump'
    case 'background':
      return 'Background'
    case 'music':
      return 'Music'
    case 'sfx':
      return 'SFX'
    case 'set':
      return 'Variable'
    case 'wait':
      return 'Wait'
    case 'code':
      return 'Luau hook'
    default:
      return 'Start'
  }
}

function buildLaneForType(type: ChapterGraphNodeType): ChapterGraphNode['lane'] {
  switch (type) {
    case 'background':
    case 'music':
    case 'sfx':
      return 'media'
    case 'condition':
    case 'set':
    case 'wait':
    case 'code':
      return 'logic'
    default:
      return 'story'
  }
}

function inferSelectedSceneId(chapter: StoryChapter | undefined): string | undefined {
  return chapter?.sceneIds[0]
}

export function EditorScreen(): React.JSX.Element {
  const document = useStoryStore(state => state.document)
  const updateChapter = useStoryStore(state => state.updateChapter)
  const mode = useEditorStore(state => state.mode)
  const setMode = useEditorStore(state => state.setMode)
  const selectedVolumeId = useEditorStore(state => state.selectedVolumeId)
  const setSelectedVolumeId = useEditorStore(state => state.setSelectedVolumeId)
  const selectedChapterId = useEditorStore(state => state.selectedChapterId)
  const setSelectedChapterId = useEditorStore(state => state.setSelectedChapterId)
  const selectedGraphNodeId = useEditorStore(state => state.selectedGraphNodeId)
  const setSelectedGraphNodeId = useEditorStore(state => state.setSelectedGraphNodeId)
  const isConnectingNodes = useEditorStore(state => state.isConnectingNodes)
  const setIsConnectingNodes = useEditorStore(state => state.setIsConnectingNodes)

  const selectedVolume: StoryVolume | undefined =
    document.volumes.find(volume => volume.id === selectedVolumeId) ?? document.volumes[0]
  const selectedChapter: StoryChapter | undefined =
    document.chapters.find(chapter => chapter.id === selectedChapterId) ??
    document.chapters.find(chapter => chapter.volumeId === selectedVolume?.id) ??
    document.chapters[0]
  const selectedNode: ChapterGraphNode | undefined = selectedChapter?.graph.nodes.find(
    node => node.id === selectedGraphNodeId,
  )
  const graphNodeCount = selectedChapter?.graph.nodes.length ?? 0
  const sceneNodeCount = countSceneNodes(document)

  useEffect(() => {
    if (!selectedVolumeId && document.volumes[0]) {
      setSelectedVolumeId(document.volumes[0].id)
    }
  }, [document.volumes, selectedVolumeId, setSelectedVolumeId])

  useEffect(() => {
    if (!selectedChapterId && document.chapters[0]) {
      setSelectedChapterId(document.chapters[0].id)
    }
  }, [document.chapters, selectedChapterId, setSelectedChapterId])

  const chapterOptions = useMemo(
    () =>
      document.chapters.filter(chapter =>
        selectedVolume ? chapter.volumeId === selectedVolume.id : true,
      ),
    [document.chapters, selectedVolume],
  )

  const appendGraphNode = (type: ChapterGraphNodeType): void => {
    if (!selectedChapter) {
      return
    }

    updateChapter(selectedChapter.id, chapter => {
      const nextIndex = chapter.graph.nodes.length + 1
      const lane = buildLaneForType(type)
      const nextPosition: GraphPosition = {
        x: 140 + (nextIndex % 4) * 196,
        y: lane === 'story' ? 76 : lane === 'media' ? 248 : 418,
      }
      const nextNode: ChapterGraphNode = {
        id: `${chapter.id}__${type}__${Date.now()}`,
        type,
        title: buildNodeTitle(type),
        lane,
        position: nextPosition,
        sceneId: chapter.sceneIds[0],
        payload: buildGraphPayload(type),
      }
      const nextEdges: GraphEdge[] =
        selectedGraphNodeId && chapter.graph.nodes.some(node => node.id === selectedGraphNodeId)
          ? [
              ...chapter.graph.edges,
              {
                id: `${selectedGraphNodeId}__${nextNode.id}`,
                source: selectedGraphNodeId,
                target: nextNode.id,
              },
            ]
          : chapter.graph.edges

      return {
        ...chapter,
        graph: {
          nodes: [...chapter.graph.nodes, nextNode],
          edges: nextEdges,
        },
      }
    })
  }

  const handleSelectNode = (nodeId: string): void => {
    if (!selectedChapter) {
      return
    }

    if (isConnectingNodes && selectedGraphNodeId && selectedGraphNodeId !== nodeId) {
      updateChapter(selectedChapter.id, chapter => {
        const alreadyExists = chapter.graph.edges.some(
          edge => edge.source === selectedGraphNodeId && edge.target === nodeId,
        )

        if (alreadyExists) {
          return chapter
        }

        return {
          ...chapter,
          graph: {
            ...chapter.graph,
            edges: [
              ...chapter.graph.edges,
              {
                id: `${selectedGraphNodeId}__${nodeId}`,
                source: selectedGraphNodeId,
                target: nodeId,
              },
            ],
          },
        }
      })
      setIsConnectingNodes(false)
    }

    setSelectedGraphNodeId(nodeId)
  }

  const handleMoveNode = (nodeId: string, position: GraphPosition): void => {
    if (!selectedChapter) {
      return
    }

    updateChapter(selectedChapter.id, chapter => ({
      ...chapter,
      graph: {
        ...chapter.graph,
        nodes: chapter.graph.nodes.map(node =>
          node.id === nodeId ? {...node, position} : node,
        ),
      },
    }))
  }

  const handleDeleteSelectedNode = (): void => {
    if (!selectedChapter || !selectedGraphNodeId) {
      return
    }

    updateChapter(selectedChapter.id, chapter => ({
      ...chapter,
      graph: {
        nodes: chapter.graph.nodes.filter(node => node.id !== selectedGraphNodeId),
        edges: chapter.graph.edges.filter(
          edge =>
            edge.source !== selectedGraphNodeId && edge.target !== selectedGraphNodeId,
        ),
      },
    }))
    setSelectedGraphNodeId(null)
    setIsConnectingNodes(false)
  }

  const updateLuau = (nextSource: string): void => {
    if (!selectedChapter) {
      return
    }

    updateChapter(selectedChapter.id, chapter => ({
      ...chapter,
      luau: nextSource,
    }))
  }

  const inspectorLines = selectedNode
    ? [
        `Lane: ${selectedNode.lane}`,
        `Type: ${selectedNode.type}`,
        `Scene: ${selectedNode.sceneId ?? 'n/a'}`,
        `Payload: ${JSON.stringify(selectedNode.payload).slice(0, 140)}`,
      ]
    : ['Select a graph node to inspect its routing payload and chapter binding.']

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <RevealView delay={0}>
        <Text style={styles.eyebrow}>Workspace</Text>
        <Text style={styles.title}>{document.meta.name}</Text>
        <Text style={styles.subtitle}>
          Volume graph, chapter graph, vector UI skin, Luau hooks, and preview playback now live in one workspace.
        </Text>
      </RevealView>

      <RevealView delay={50}>
        <MoeCard
          accent
          subtitle={`${document.volumes.length} volumes • ${document.chapters.length} chapters • ${sceneNodeCount} authored nodes`}
          title="Story architecture">
          <Text style={styles.bodyCopy}>
            The project now separates file/workspace structure from authoring logic. Volumes route chapters, while each chapter owns its own graph, timeline lanes, and Luau hooks.
          </Text>
        </MoeCard>
      </RevealView>

      <RevealView delay={90}>
        <Text style={styles.sectionLabel}>Volumes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.pillRow}>
            {document.volumes.map(volume => (
              <Pill
                key={volume.id}
                active={selectedVolume?.id === volume.id}
                label={volume.name}
                onPress={() => {
                  setSelectedVolumeId(volume.id)
                  const fallbackChapter = document.chapters.find(
                    chapter => chapter.volumeId === volume.id,
                  )
                  setSelectedChapterId(fallbackChapter?.id ?? null)
                  setSelectedGraphNodeId(null)
                }}
              />
            ))}
          </View>
        </ScrollView>
      </RevealView>

      <RevealView delay={120}>
        <Text style={styles.sectionLabel}>Chapters</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chapterRow}>
            {chapterOptions.map(chapter => (
              <MoeCard
                key={chapter.id}
                onPress={() => {
                  setSelectedChapterId(chapter.id)
                  setSelectedGraphNodeId(null)
                }}
                style={[
                  styles.chapterCard,
                  selectedChapter?.id === chapter.id ? styles.chapterCardActive : null,
                ]}
                subtitle={`${chapter.graph.nodes.length} graph nodes • ${chapter.tuesdayCoverage.supported} supported`}
                title={chapter.name}>
                <Text style={styles.chapterBody}>{chapter.summary}</Text>
              </MoeCard>
            ))}
          </View>
        </ScrollView>
      </RevealView>

      <RevealView delay={150}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.modeRow}>
            {(['graph', 'logic', 'preview', 'code', 'assets'] as const).map(item => (
              <Pill
                key={item}
                active={mode === item}
                label={item}
                onPress={() => setMode(item)}
              />
            ))}
          </View>
        </ScrollView>
      </RevealView>

      <RevealView delay={180}>
        <MoeCard
          subtitle={`${graphNodeCount} nodes • ${selectedChapter?.graph.edges.length ?? 0} edges`}
          title={selectedChapter ? `${selectedChapter.name} graph` : 'Chapter graph'}>
          <View style={styles.graphActionWrap}>
            <GraphActionButton
              emphasis
              label={isConnectingNodes ? 'Tap target node…' : 'Connect selected'}
              onPress={() => setIsConnectingNodes(!isConnectingNodes)}
            />
            <GraphActionButton label="Add dialogue" onPress={() => appendGraphNode('dialogue')} />
            <GraphActionButton label="Add choice" onPress={() => appendGraphNode('choice')} />
            <GraphActionButton label="Add logic" onPress={() => appendGraphNode('condition')} />
            <GraphActionButton label="Add media" onPress={() => appendGraphNode('background')} />
            <GraphActionButton label="Add Luau" onPress={() => appendGraphNode('code')} />
            <GraphActionButton label="Delete selected" onPress={handleDeleteSelectedNode} />
          </View>

          {selectedChapter ? (
            <View style={styles.canvasWrap}>
              <NodeGraphCanvas
                graph={selectedChapter.graph}
                onMoveNode={handleMoveNode}
                onSelectNode={handleSelectNode}
                selectedNodeId={selectedGraphNodeId}
              />
            </View>
          ) : (
            <Text style={styles.bodyCopy}>Create or import a chapter to start graph editing.</Text>
          )}
        </MoeCard>
      </RevealView>

      <RevealView delay={210}>
        <MoeCard
          subtitle={selectedChapter?.timelineLanes.map(lane => lane.title).join(' • ') ?? 'No chapter selected'}
          title="Inspector">
          {inspectorLines.map(line => (
            <Text key={line} style={styles.inspectorLine}>
              {line}
            </Text>
          ))}
        </MoeCard>
      </RevealView>

      {mode === 'logic' || mode === 'code' ? (
        <RevealView delay={240}>
          <LuauEditor
            onChangeSource={updateLuau}
            source={selectedChapter?.luau ?? '-- Select a chapter'}
          />
        </RevealView>
      ) : null}

      {mode === 'preview' || mode === 'graph' ? (
        <RevealView delay={270}>
          <MoeCard
            subtitle={`${document.parameters.orientation} • ${document.parameters.builtInUi.choiceStyle} choices • ${document.parameters.builtInUi.chatFrameStyle} frame`}
            title="Runtime preview">
            <TuesdayPreview
              document={document}
              selectedSceneId={inferSelectedSceneId(selectedChapter)}
            />
          </MoeCard>
        </RevealView>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: moeTheme.colors.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 120,
    gap: 16,
  },
  eyebrow: {
    color: moeTheme.colors.primaryStrong,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: moeTheme.colors.text,
    fontSize: moeTheme.typography.title,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: moeTheme.colors.textMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  bodyCopy: {
    color: moeTheme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionLabel: {
    color: moeTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: -2,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 6,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: moeTheme.radius.pill,
    backgroundColor: moeTheme.colors.surface,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  pillActive: {
    backgroundColor: moeTheme.colors.primaryStrong,
    borderColor: moeTheme.colors.primaryStrong,
  },
  pillLabel: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  pillLabelActive: {
    color: '#FFF8FA',
  },
  chapterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 6,
  },
  chapterCard: {
    width: 270,
  },
  chapterCardActive: {
    borderColor: 'rgba(182, 80, 114, 0.35)',
    backgroundColor: '#FDF5F7',
  },
  chapterBody: {
    color: moeTheme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 6,
  },
  graphActionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  graphActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: moeTheme.radius.pill,
    backgroundColor: moeTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  graphActionButtonPrimary: {
    backgroundColor: moeTheme.colors.primaryStrong,
    borderColor: moeTheme.colors.primaryStrong,
  },
  graphActionLabel: {
    color: moeTheme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  graphActionLabelPrimary: {
    color: '#FFF8FA',
  },
  canvasWrap: {
    marginTop: 6,
  },
  inspectorLine: {
    color: moeTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  pressed: {
    opacity: 0.92,
  },
})
