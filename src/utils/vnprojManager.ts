import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import JSZip from 'jszip'

import {
  AssetCategory,
  createStarterStoryDocument,
  ensureStoryDocumentShape,
  ProjectAsset,
  StoryDocument,
} from '@/types/StoryDocument'
import {serializeStoryDocument} from '@/utils/tuesdaySerializer'

export type ExportFormat = 'MoeZipPackage' | 'TuesdayJson' | 'LuauScripts'

export interface ProjectConfig {
  name: string
  seedWithStarter?: boolean
}

export interface ProjectHandle {
  name: string
  path: string
  modifiedAt: string
}

interface WorkspaceSnapshot {
  project: ProjectHandle
  document: StoryDocument
}

export interface ProjectTreeEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  sizeBytes: number
  children?: ProjectTreeEntry[]
}

interface ProjectPackageManifest {
  schemaVersion: '2'
  projectId: string
  projectName: string
  generatedAt: string
  orientation: StoryDocument['parameters']['orientation']
  files: Array<{
    path: string
    sizeBytes: number
    hash: string
  }>
}

const WORKSPACE_FOLDER_NAME = 'moe-studio'
const PROJECT_FILE_NAME = 'story.json'
const TUESDAY_FILE_NAME = 'tuesday.json'
const METADATA_FILE_NAME = 'moe-project.json'
const MANIFEST_FILE_NAME = 'manifest.json'
const ASSETS_DIRECTORY = 'assets'
const UI_SKIN_DIRECTORY = 'ui-skin'

function stripFileScheme(path: string): string {
  return path.replace('file://', '')
}

function sanitizeName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function createTimestamp(): string {
  return new Date().toISOString()
}

function hashString(value: string): string {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return Math.abs(hash >>> 0).toString(16)
}

function createAssetSubdirectory(category: AssetCategory): string {
  return `${ASSETS_DIRECTORY}/${category}s`
}

function cloneDocument(document: StoryDocument): StoryDocument {
  return JSON.parse(JSON.stringify(ensureStoryDocumentShape(document))) as StoryDocument
}

function normalizeDocumentForExport(document: StoryDocument): {
  portableDocument: StoryDocument
  assetCopies: Array<{source: string; target: string}>
} {
  const hydrated = ensureStoryDocumentShape(document)
  const pathMap: Record<string, string> = {}
  const assetCopies: Array<{source: string; target: string}> = []

  const portableAssets: ProjectAsset[] = hydrated.assets.map(asset => {
    const target: string = `${createAssetSubdirectory(asset.category)}/${asset.name}`
    pathMap[asset.path] = target
    assetCopies.push({source: asset.path, target})

    return {
      ...asset,
      path: target,
    }
  })

  const replacePath = (value: string | null): string | null => {
    if (!value) {
      return value
    }

    return pathMap[value] ?? value
  }

  const portableDocument: StoryDocument = {
    ...cloneDocument(hydrated),
    assets: portableAssets,
    characters: hydrated.characters.map(character => ({
      ...character,
      sprites: Object.fromEntries(
        Object.entries(character.sprites).map(([key, value]) => [
          key,
          replacePath(value) ?? value,
        ]),
      ),
    })),
    scenes: hydrated.scenes.map(scene => ({
      ...scene,
      background: replacePath(scene.background),
      music: replacePath(scene.music),
      nodes: scene.nodes.map(node => {
        switch (node.type) {
          case 'background':
            return {...node, image: replacePath(node.image) ?? node.image}
          case 'music':
            return {...node, file: replacePath(node.file) ?? node.file}
          case 'sfx':
            return {...node, file: replacePath(node.file) ?? node.file}
          case 'dialogue':
            return {...node, sprite: replacePath(node.sprite ?? null) ?? node.sprite}
          case 'showChar':
            return {...node, sprite: replacePath(node.sprite) ?? node.sprite}
          default:
            return node
        }
      }),
    })),
  }

  return {portableDocument, assetCopies}
}

function resolveProjectFile(path: string): string {
  return `${path}/${PROJECT_FILE_NAME}`
}

function resolveMetadataFile(path: string): string {
  return `${path}/${METADATA_FILE_NAME}`
}

function resolveWorkspaceRoot(): string {
  return `${RNFS.DocumentDirectoryPath}/${WORKSPACE_FOLDER_NAME}`
}

async function ensureDirectory(path: string): Promise<void> {
  const exists: boolean = await RNFS.exists(path)

  if (!exists) {
    await RNFS.mkdir(path)
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await RNFS.writeFile(path, JSON.stringify(value, null, 2), 'utf8')
}

async function readJson<T>(path: string): Promise<T> {
  const contents: string = await RNFS.readFile(path, 'utf8')
  return JSON.parse(contents) as T
}

async function ensureUniqueProjectPath(
  workspaceRoot: string,
  requestedName: string,
): Promise<string> {
  const baseName = sanitizeName(requestedName) || 'untitled-project'
  let candidate = `${workspaceRoot}/${baseName}`
  let copyIndex = 2

  while (await RNFS.exists(candidate)) {
    candidate = `${workspaceRoot}/${baseName}-copy-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

async function buildProjectTree(
  path: string,
  depth = 0,
  maxDepth = 5,
): Promise<ProjectTreeEntry[]> {
  if (depth > maxDepth) {
    return []
  }

  const items = await RNFS.readDir(path)
  const entries = await Promise.all(
    items
      .sort((left, right) => {
        if (left.isDirectory() === right.isDirectory()) {
          return left.name.localeCompare(right.name)
        }

        return left.isDirectory() ? -1 : 1
      })
      .map(async item => {
        if (item.isDirectory()) {
          return {
            name: item.name,
            path: item.path,
            type: 'directory' as const,
            sizeBytes: 0,
            children: await buildProjectTree(item.path, depth + 1, maxDepth),
          }
        }

        return {
          name: item.name,
          path: item.path,
          type: 'file' as const,
          sizeBytes: item.size,
        }
      }),
  )

  return entries
}

async function hashFile(path: string): Promise<string> {
  if (typeof RNFS.hash === 'function') {
    return RNFS.hash(path, 'md5')
  }

  const base64 = await RNFS.readFile(path, 'base64')
  return hashString(base64)
}

function createProjectHandle(name: string, path: string): ProjectHandle {
  return {
    name,
    path,
    modifiedAt: createTimestamp(),
  }
}

function isFilePickerResultAvailable(
  file: DocumentPickerResponse | null,
): file is DocumentPickerResponse & {fileCopyUri: string} {
  return Boolean(file?.fileCopyUri)
}

export const VnprojManager = {
  async ensureWorkspace(): Promise<string> {
    const root: string = resolveWorkspaceRoot()
    await ensureDirectory(root)
    return root
  },

  async listProjects(): Promise<ProjectHandle[]> {
    const root: string = await this.ensureWorkspace()
    const items = await RNFS.readDir(root)
    const snapshots = await Promise.all(
      items
        .filter(item => item.isDirectory())
        .map(async item => {
          const metadataPath: string = resolveMetadataFile(item.path)
          const storyPath: string = resolveProjectFile(item.path)
          const hasProject: boolean = await RNFS.exists(metadataPath)
          const hasStory: boolean = await RNFS.exists(storyPath)

          if (!hasProject || !hasStory) {
            return null
          }

          return readJson<ProjectHandle>(metadataPath)
        }),
    )

    return snapshots
      .filter((item): item is ProjectHandle => Boolean(item))
      .sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt))
  },

  async bootstrapWorkspace(): Promise<WorkspaceSnapshot> {
    const projects: ProjectHandle[] = await this.listProjects()

    if (projects.length > 0) {
      const project: ProjectHandle = projects[0]
      const document: StoryDocument = await this.loadProjectDocument(project.path)
      return {project, document}
    }

    return this.newProject({name: 'Moonlit Demo', seedWithStarter: true})
  },

  async newProject(config: ProjectConfig): Promise<WorkspaceSnapshot> {
    const workspaceRoot: string = await this.ensureWorkspace()
    const projectPath: string = await ensureUniqueProjectPath(workspaceRoot, config.name)
    const document: StoryDocument = config.seedWithStarter
      ? createStarterStoryDocument(config.name)
      : createStarterStoryDocument(config.name)

    await ensureDirectory(projectPath)
    await ensureDirectory(`${projectPath}/${ASSETS_DIRECTORY}`)
    const project: ProjectHandle = createProjectHandle(config.name, projectPath)
    const nextProject = await this.saveProject(project, document)

    return {project: nextProject, document}
  },

  async openProject(path: string): Promise<ProjectHandle> {
    return readJson<ProjectHandle>(resolveMetadataFile(path))
  },

  async loadProjectDocument(path: string): Promise<StoryDocument> {
    const document = await readJson<StoryDocument>(resolveProjectFile(path))
    return ensureStoryDocumentShape(document)
  },

  async saveProject(project: ProjectHandle, document: StoryDocument): Promise<ProjectHandle> {
    const nextDocument = ensureStoryDocumentShape(document)
    await ensureDirectory(project.path)
    await ensureDirectory(`${project.path}/${ASSETS_DIRECTORY}`)
    const nextProject: ProjectHandle = {
      ...project,
      name: nextDocument.meta.name,
      modifiedAt: createTimestamp(),
    }

    await writeJson(resolveProjectFile(project.path), nextDocument)
    await writeJson(resolveMetadataFile(project.path), nextProject)

    return nextProject
  },

  async listProjectTree(projectPath: string): Promise<ProjectTreeEntry[]> {
    const exists = await RNFS.exists(projectPath)

    if (!exists) {
      return []
    }

    return buildProjectTree(projectPath)
  },

  async importAsset(
    projectPath: string,
    category: AssetCategory,
  ): Promise<ProjectAsset | null> {
    try {
      const file = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.audio,
          DocumentPicker.types.video,
        ],
        copyTo: 'documentDirectory',
      })

      if (!isFilePickerResultAvailable(file)) {
        return null
      }

      const source: string = stripFileScheme(file.fileCopyUri)
      const assetDirectory: string = `${projectPath}/${createAssetSubdirectory(category)}`
      const name: string = file.name ?? `${category}-${Date.now()}`
      const destination: string = `${assetDirectory}/${name}`

      await ensureDirectory(assetDirectory)
      await RNFS.copyFile(source, destination)

      return {
        id: `${category}-${Date.now()}`,
        name,
        category,
        path: destination,
        sizeBytes: file.size ?? 0,
        importedAt: createTimestamp(),
      }
    } catch (error: unknown) {
      if (DocumentPicker.isCancel(error)) {
        return null
      }

      throw error
    }
  },

  async exportProject(
    project: ProjectHandle,
    document: StoryDocument,
    format: ExportFormat,
  ): Promise<string> {
    const hydratedDocument = ensureStoryDocumentShape(document)
    const exportsRoot: string = `${project.path}/exports`
    await ensureDirectory(exportsRoot)

    if (format === 'TuesdayJson') {
      const filePath: string = `${exportsRoot}/${sanitizeName(project.name)}.tuesday.json`
      await writeJson(filePath, serializeStoryDocument(hydratedDocument))
      return filePath
    }

    if (format === 'LuauScripts') {
      const filePath: string = `${exportsRoot}/${sanitizeName(project.name)}.luau.json`
      await writeJson(filePath, {
        note: 'Luau source export placeholder',
        generatedAt: createTimestamp(),
        scenes: hydratedDocument.scenes.map(scene => ({
          id: scene.id,
          blocks: scene.nodes.filter(node => node.type === 'codeBlock'),
        })),
        chapters: hydratedDocument.chapters.map(chapter => ({
          id: chapter.id,
          name: chapter.name,
          luau: chapter.luau,
        })),
      })
      return filePath
    }

    const zip = new JSZip()
    const {portableDocument, assetCopies} = normalizeDocumentForExport(hydratedDocument)
    const exportFile: string = `${RNFS.DownloadDirectoryPath}/${sanitizeName(project.name)}.moezip`
    const tuesdayPayload = serializeStoryDocument(hydratedDocument)
    const skinCatalog = hydratedDocument.builtInAssets
    const manifestFiles: ProjectPackageManifest['files'] = [
      {
        path: PROJECT_FILE_NAME,
        sizeBytes: JSON.stringify(portableDocument).length,
        hash: hashString(JSON.stringify(portableDocument)),
      },
      {
        path: TUESDAY_FILE_NAME,
        sizeBytes: JSON.stringify(tuesdayPayload).length,
        hash: hashString(JSON.stringify(tuesdayPayload)),
      },
      {
        path: `${UI_SKIN_DIRECTORY}/catalog.json`,
        sizeBytes: JSON.stringify(skinCatalog).length,
        hash: hashString(JSON.stringify(skinCatalog)),
      },
    ]

    zip.file(PROJECT_FILE_NAME, JSON.stringify(portableDocument, null, 2))
    zip.file(TUESDAY_FILE_NAME, JSON.stringify(tuesdayPayload, null, 2))
    zip.file(`${UI_SKIN_DIRECTORY}/catalog.json`, JSON.stringify(skinCatalog, null, 2))
    zip.file(
      METADATA_FILE_NAME,
      JSON.stringify(
        {
          project,
          generatedAt: createTimestamp(),
          orientation: hydratedDocument.parameters.orientation,
        },
        null,
        2,
      ),
    )

    await Promise.all(
      assetCopies.map(async assetCopy => {
        const exists: boolean = await RNFS.exists(assetCopy.source)

        if (!exists) {
          return
        }

        const contents: string = await RNFS.readFile(assetCopy.source, 'base64')
        zip.file(assetCopy.target, contents, {base64: true})
        manifestFiles.push({
          path: assetCopy.target,
          sizeBytes: (await RNFS.stat(assetCopy.source)).size,
          hash: await hashFile(assetCopy.source),
        })
      }),
    )

    const manifest: ProjectPackageManifest = {
      schemaVersion: '2',
      projectId: sanitizeName(project.name),
      projectName: hydratedDocument.meta.name,
      generatedAt: createTimestamp(),
      orientation: hydratedDocument.parameters.orientation,
      files: manifestFiles,
    }

    zip.file(MANIFEST_FILE_NAME, JSON.stringify(manifest, null, 2))

    const zipBase64: string = await zip.generateAsync({type: 'base64'})
    await RNFS.writeFile(exportFile, zipBase64, 'base64')

    if (typeof RNFS.scanFile === 'function') {
      await RNFS.scanFile(exportFile)
    }

    return exportFile
  },

  async importProjectPackage(): Promise<WorkspaceSnapshot | null> {
    try {
      const packageFile = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.zip, DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      })

      if (!isFilePickerResultAvailable(packageFile)) {
        return null
      }

      const source: string = stripFileScheme(packageFile.fileCopyUri)
      const contents: string = await RNFS.readFile(source, 'base64')
      const zip = await JSZip.loadAsync(contents, {base64: true})
      const rawManifest = await zip.file(MANIFEST_FILE_NAME)?.async('string')
      const rawStory = await zip.file(PROJECT_FILE_NAME)?.async('string')

      if (!rawStory) {
        throw new Error('Selected package does not contain a project story.json file')
      }

      const manifest = rawManifest
        ? (JSON.parse(rawManifest) as ProjectPackageManifest)
        : null
      const portableDocument = ensureStoryDocumentShape(
        JSON.parse(rawStory) as StoryDocument,
      )
      const workspaceRoot: string = await this.ensureWorkspace()
      const requestedName = manifest?.projectName ?? portableDocument.meta.name
      const projectPath: string = await ensureUniqueProjectPath(workspaceRoot, requestedName)
      await ensureDirectory(projectPath)

      await Promise.all(
        Object.keys(zip.files)
          .filter(
            fileName =>
              (fileName.startsWith(`${ASSETS_DIRECTORY}/`) ||
                fileName.startsWith(`${UI_SKIN_DIRECTORY}/`)) &&
              !zip.files[fileName].dir,
          )
          .map(async fileName => {
            const destination: string = `${projectPath}/${fileName}`
            const directory: string = destination.slice(0, destination.lastIndexOf('/'))
            await ensureDirectory(directory)
            const fileBase64: string = await zip.file(fileName)!.async('base64')
            await RNFS.writeFile(destination, fileBase64, 'base64')
          }),
      )

      const restoredDocument: StoryDocument = ensureStoryDocumentShape({
        ...portableDocument,
        assets: portableDocument.assets.map(asset => ({
          ...asset,
          path: `${projectPath}/${asset.path}`,
        })),
        builtInAssets: portableDocument.builtInAssets,
        characters: portableDocument.characters.map(character => ({
          ...character,
          sprites: Object.fromEntries(
            Object.entries(character.sprites).map(([key, value]) => [
              key,
              value.startsWith(ASSETS_DIRECTORY) ? `${projectPath}/${value}` : value,
            ]),
          ),
        })),
        scenes: portableDocument.scenes.map(scene => ({
          ...scene,
          background:
            scene.background && scene.background.startsWith(ASSETS_DIRECTORY)
              ? `${projectPath}/${scene.background}`
              : scene.background,
          music:
            scene.music && scene.music.startsWith(ASSETS_DIRECTORY)
              ? `${projectPath}/${scene.music}`
              : scene.music,
        })),
      })

      const project: ProjectHandle = createProjectHandle(requestedName, projectPath)
      const nextProject = await this.saveProject(project, restoredDocument)

      return {
        project: nextProject,
        document: restoredDocument,
      }
    } catch (error: unknown) {
      if (DocumentPicker.isCancel(error)) {
        return null
      }

      throw error
    }
  },
}
