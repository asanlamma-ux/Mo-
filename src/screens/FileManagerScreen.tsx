import React, {useEffect, useState} from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import {MoeCard} from '@/components/MoeCard'
import {RevealView} from '@/components/RevealView'
import {
  promptForAppSettings,
  requestStudioStoragePermission,
} from '@/services/storagePermissions'
import {ExportRecord, useProjectStore} from '@/store/useProjectStore'
import {useStoryStore} from '@/store/useStoryStore'
import {AssetCategory, ProjectAsset} from '@/types/StoryDocument'
import {moeTheme} from '@/theme/moeTheme'
import {
  ProjectTreeEntry,
  VnprojManager,
} from '@/utils/vnprojManager'

const assetCategories: AssetCategory[] = [
  'background',
  'sprite',
  'music',
  'sfx',
  'video',
  'ui',
]

function ActionButton({
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
        styles.actionButton,
        emphasis ? styles.actionButtonPrimary : null,
        pressed ? styles.pressed : null,
      ]}>
      <Text style={[styles.actionLabel, emphasis ? styles.actionLabelPrimary : null]}>
        {label}
      </Text>
    </Pressable>
  )
}

function FileTree({
  entries,
  depth = 0,
}: {
  entries: ProjectTreeEntry[]
  depth?: number
}): React.JSX.Element {
  return (
    <View>
      {entries.map(entry => (
        <View key={entry.path}>
          <View style={[styles.treeRow, {paddingLeft: 12 + depth * 16}]}>
            <Text style={styles.treeName}>
              {entry.type === 'directory' ? '▾ ' : '• '}
              {entry.name}
            </Text>
            <Text style={styles.treeMeta}>
              {entry.type === 'directory'
                ? `${entry.children?.length ?? 0} items`
                : `${(entry.sizeBytes / 1024).toFixed(1)} KB`}
            </Text>
          </View>
          {entry.children?.length ? <FileTree depth={depth + 1} entries={entry.children} /> : null}
        </View>
      ))}
    </View>
  )
}

export function FileManagerScreen(): React.JSX.Element {
  const [isWorking, setIsWorking] = useState(false)
  const [projectTree, setProjectTree] = useState<ProjectTreeEntry[]>([])
  const permissionState = useProjectStore(state => state.permissionState)
  const workspaceRoot = useProjectStore(state => state.workspaceRoot)
  const workspaceDirectoryUri = useProjectStore(state => state.workspaceDirectoryUri)
  const activeProjectPath = useProjectStore(state => state.activeProjectPath)
  const recentProjects = useProjectStore(state => state.recentProjects)
  const exportHistory = useProjectStore(state => state.exportHistory)
  const setWorkspaceDirectoryUri = useProjectStore(state => state.setWorkspaceDirectoryUri)
  const setPermissionState = useProjectStore(state => state.setPermissionState)
  const setRecentProjects = useProjectStore(state => state.setRecentProjects)
  const setActiveProjectPath = useProjectStore(state => state.setActiveProjectPath)
  const addRecentProject = useProjectStore(state => state.addRecentProject)
  const setDocument = useStoryStore(state => state.setDocument)
  const document = useStoryStore(state => state.document)

  useEffect(() => {
    const loadTree = async (): Promise<void> => {
      if (!activeProjectPath) {
        setProjectTree([])
        return
      }

      setProjectTree(await VnprojManager.listProjectTree(activeProjectPath))
    }

    void loadTree()
  }, [activeProjectPath, document.meta.modified])

  const executeAsync = async (work: () => Promise<void>): Promise<void> => {
    try {
      setIsWorking(true)
      await work()
    } catch (error) {
      Alert.alert(
        'Action failed',
        error instanceof Error ? error.message : 'Unexpected file action failure',
      )
    } finally {
      setIsWorking(false)
    }
  }

  const requestPermission = (): Promise<void> =>
    executeAsync(async () => {
      const nextState = await requestStudioStoragePermission()
      setPermissionState(nextState)

      if (nextState === 'blocked') {
        promptForAppSettings()
      }
    })

  const refreshWorkspace = (): Promise<void> =>
    executeAsync(async () => {
      const projects = await VnprojManager.listProjects()
      setRecentProjects(projects)

      if (activeProjectPath) {
        setProjectTree(await VnprojManager.listProjectTree(activeProjectPath))
      }
    })

  const createProject = (): Promise<void> =>
    executeAsync(async () => {
      const snapshot = await VnprojManager.newProject({
        name: `Studio Draft ${new Date().toLocaleDateString()}`,
        seedWithStarter: true,
      })
      setDocument(snapshot.document)
      setActiveProjectPath(snapshot.project.path)
      addRecentProject(snapshot.project)
      setRecentProjects(await VnprojManager.listProjects())
      setProjectTree(await VnprojManager.listProjectTree(snapshot.project.path))
    })

  const openProject = (path: string): Promise<void> =>
    executeAsync(async () => {
      const project = await VnprojManager.openProject(path)
      const nextDocument = await VnprojManager.loadProjectDocument(path)
      setDocument(nextDocument)
      setActiveProjectPath(project.path)
      addRecentProject(project)
      setProjectTree(await VnprojManager.listProjectTree(project.path))
    })

  const pickWorkspaceDirectory = (): Promise<void> =>
    executeAsync(async () => {
      const directory = await DocumentPicker.pickDirectory()
      setWorkspaceDirectoryUri(directory?.uri ?? null)
    })

  const importAsset = (category: AssetCategory): Promise<void> =>
    executeAsync(async () => {
      if (!activeProjectPath) {
        Alert.alert(
          'No active project',
          'Create or open a project workspace before importing assets.',
        )
        return
      }

      const importedAsset = await VnprojManager.importAsset(activeProjectPath, category)

      if (!importedAsset) {
        return
      }

      const nextDocument = {
        ...document,
        assets: [importedAsset, ...document.assets.filter(asset => asset.id !== importedAsset.id)],
        meta: {
          ...document.meta,
          modified: new Date().toISOString(),
        },
      }

      setDocument(nextDocument)
      const project = await VnprojManager.openProject(activeProjectPath)
      const savedProject = await VnprojManager.saveProject(project, nextDocument)
      addRecentProject(savedProject)
      setRecentProjects(await VnprojManager.listProjects())
      setProjectTree(await VnprojManager.listProjectTree(activeProjectPath))
    })

  const importPackage = (): Promise<void> =>
    executeAsync(async () => {
      const snapshot = await VnprojManager.importProjectPackage()

      if (!snapshot) {
        return
      }

      setDocument(snapshot.document)
      setActiveProjectPath(snapshot.project.path)
      addRecentProject(snapshot.project)
      setRecentProjects(await VnprojManager.listProjects())
      setProjectTree(await VnprojManager.listProjectTree(snapshot.project.path))
    })

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <RevealView delay={0}>
        <Text style={styles.eyebrow}>File Manager</Text>
        <Text style={styles.title}>Project workspace</Text>
        <Text style={styles.subtitle}>
          Native storage access, recent project switching, recursive explorer tree, asset import, and package restore all live here now.
        </Text>
      </RevealView>

      <RevealView delay={70}>
        <MoeCard
          accent
          subtitle={`Workspace root: ${workspaceRoot ?? 'Not resolved yet'}`}
          title={
            permissionState === 'granted' ? 'Storage access granted' : 'Storage access required'
          }>
          <Text style={styles.bodyCopy}>
            Moe requests storage and media access on launch so it can manage chapter assets, workspace folders, and portable project packages.
          </Text>
          <View style={styles.actionWrap}>
            <ActionButton
              emphasis
              label="Request permission"
              onPress={() => void requestPermission()}
            />
            <ActionButton label="Open app settings" onPress={promptForAppSettings} />
          </View>
        </MoeCard>
      </RevealView>

      <RevealView delay={110}>
        <MoeCard
          subtitle={workspaceDirectoryUri ?? 'Optional external folder binding for imports.'}
          title="Workspace controls">
          <View style={styles.actionWrap}>
            <ActionButton label="Choose folder" onPress={() => void pickWorkspaceDirectory()} />
            <ActionButton label="Refresh workspace" onPress={() => void refreshWorkspace()} />
            <ActionButton emphasis label="New starter project" onPress={() => void createProject()} />
          </View>
        </MoeCard>
      </RevealView>

      <RevealView delay={150}>
        <MoeCard
          subtitle={activeProjectPath ?? 'No active project selected'}
          title="Project explorer">
          {projectTree.length === 0 ? (
            <Text style={styles.bodyCopy}>
              Select or create a project to browse its files.
            </Text>
          ) : (
            <FileTree entries={projectTree} />
          )}
        </MoeCard>
      </RevealView>

      <RevealView delay={190}>
        <MoeCard subtitle="Import assets into the current project workspace." title="Asset intake">
          <View style={styles.chipGrid}>
            {assetCategories.map(category => (
              <Pressable
                key={category}
                onPress={() => void importAsset(category)}
                style={({pressed}) => [styles.assetChip, pressed ? styles.pressed : null]}>
                <Text style={styles.assetChipLabel}>{category}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.actionWrap}>
            <ActionButton
              emphasis
              label={isWorking ? 'Working…' : 'Import .moezip package'}
              onPress={() => void importPackage()}
            />
          </View>
        </MoeCard>
      </RevealView>

      <RevealView delay={230}>
        <Text style={styles.sectionTitle}>Imported assets</Text>
        {document.assets.length === 0 ? (
          <MoeCard subtitle="No files imported yet." title="Workspace assets">
            <Text style={styles.bodyCopy}>
              Import backgrounds, sprite sheets, music, SFX, video, and built-in UI skins from this screen.
            </Text>
          </MoeCard>
        ) : (
          document.assets.slice(0, 8).map((asset: ProjectAsset) => (
            <MoeCard
              key={asset.id}
              subtitle={`${asset.category} • ${(asset.sizeBytes / 1024).toFixed(1)} KB`}
              style={styles.assetCard}
              title={asset.name}>
              <Text style={styles.pathLabel}>{asset.path}</Text>
            </MoeCard>
          ))
        )}
      </RevealView>

      <RevealView delay={270}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <MoeCard subtitle={`${recentProjects.length} projects • ${exportHistory.length} exports`} title="Recent projects">
          {recentProjects.slice(0, 6).map(project => (
            <Pressable
              key={project.path}
              onPress={() => void openProject(project.path)}
              style={({pressed}) => [styles.historyRow, pressed ? styles.pressed : null]}>
              <View>
                <Text style={styles.historyName}>{project.name}</Text>
                <Text style={styles.historyMeta}>{project.path}</Text>
              </View>
              <Text style={styles.historyDate}>
                {new Date(project.modifiedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}
          {recentProjects.length === 0 ? (
            <Text style={styles.pathLabel}>Workspace is still empty.</Text>
          ) : null}
          {exportHistory.slice(0, 2).map((record: ExportRecord) => (
            <View key={`${record.path}-${record.createdAt}`} style={styles.historyRowStatic}>
              <Text style={styles.historyName}>{record.format}</Text>
              <Text style={styles.historyMeta}>{record.path}</Text>
            </View>
          ))}
        </MoeCard>
      </RevealView>
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
    paddingBottom: 110,
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
  actionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    borderRadius: moeTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: moeTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: moeTheme.colors.primaryStrong,
    borderColor: moeTheme.colors.primaryStrong,
  },
  actionLabel: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  actionLabelPrimary: {
    color: '#FFF8FA',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  assetChip: {
    borderRadius: moeTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: moeTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  assetChipLabel: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  assetCard: {
    marginBottom: 12,
  },
  pathLabel: {
    color: moeTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: moeTheme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyRowStatic: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
    gap: 6,
  },
  historyName: {
    color: moeTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyMeta: {
    color: moeTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  historyDate: {
    color: moeTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  treeRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
  },
  treeName: {
    color: moeTheme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  treeMeta: {
    color: moeTheme.colors.textMuted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.9,
  },
})
