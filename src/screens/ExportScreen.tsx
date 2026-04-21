import React, {useState} from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {MoeCard} from '@/components/MoeCard'
import {RevealView} from '@/components/RevealView'
import {useProjectStore} from '@/store/useProjectStore'
import {useStoryStore} from '@/store/useStoryStore'
import {moeTheme} from '@/theme/moeTheme'
import {ExportFormat, VnprojManager} from '@/utils/vnprojManager'

const exportOptions: Array<{
  format: ExportFormat
  title: string
  body: string
}> = [
  {
    format: 'MoeZipPackage',
    title: 'Shareable zip package',
    body: 'Bundles story.json, project metadata, Tuesday preview JSON, and imported assets for handoff to other users.',
  },
  {
    format: 'TuesdayJson',
    title: 'Tuesday-compatible JSON',
    body: 'Exports the exact runtime-oriented Tuesday project payload for preview or migration workflows.',
  },
  {
    format: 'LuauScripts',
    title: 'Luau export notes',
    body: 'Produces a generated workspace file describing code-block payloads and future script export hooks.',
  },
]

export function ExportScreen(): React.JSX.Element {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
  const activeProjectPath = useProjectStore(state => state.activeProjectPath)
  const addExportRecord = useProjectStore(state => state.addExportRecord)
  const exportHistory = useProjectStore(state => state.exportHistory)
  const document = useStoryStore(state => state.document)

  const handleExport = async (format: ExportFormat): Promise<void> => {
    if (!activeProjectPath) {
      Alert.alert('No active project', 'Open or create a project before exporting.')
      return
    }

    try {
      setIsExporting(format)
      const project = await VnprojManager.openProject(activeProjectPath)
      const path = await VnprojManager.exportProject(project, document, format)
      addExportRecord({
        format,
        path,
        createdAt: new Date().toISOString(),
      })
      Alert.alert('Export complete', path)
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unexpected export failure')
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <RevealView delay={0}>
        <Text style={styles.eyebrow}>Export & Share</Text>
        <Text style={styles.title}>Project packaging</Text>
        <Text style={styles.subtitle}>
          Package stories, assets, backgrounds, sprites, audio, and built-in UI settings into portable outputs.
        </Text>
      </RevealView>

      <RevealView delay={70}>
        <MoeCard
          accent
          subtitle={`${document.assets.length} assets • ${document.chapters.length} chapters • ${document.parameters.orientation} orientation`}
          title="Package contents">
          <Text style={styles.bodyCopy}>
            Exports now include a package manifest, normalized story document, Tuesday payload, vector UI-skin catalog, and imported assets.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Backgrounds, sprites, video, audio, and built-in vector skin metadata</Text>
            <Text style={styles.bullet}>• Project settings that can switch portrait or landscape later</Text>
            <Text style={styles.bullet}>• Tuesday preview data, graph-ready chapter metadata, and preserved migration placeholders</Text>
          </View>
        </MoeCard>
      </RevealView>

      {exportOptions.map((option, index) => (
        <RevealView delay={120 + index * 50} key={option.format}>
          <MoeCard subtitle={option.body} title={option.title}>
            <Pressable
              onPress={() => void handleExport(option.format)}
              style={({pressed}) => [
                styles.exportButton,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.exportButtonLabel}>
                {isExporting === option.format ? 'Exporting…' : `Export ${option.format}`}
              </Text>
            </Pressable>
          </MoeCard>
        </RevealView>
      ))}

      <RevealView delay={300}>
        <Text style={styles.sectionTitle}>Recent exports</Text>
        <MoeCard subtitle={`${exportHistory.length} generated files in this session`} title="Output log">
          {exportHistory.length === 0 ? (
            <Text style={styles.bodyCopy}>No exports created yet.</Text>
          ) : (
            exportHistory.map(record => (
              <View key={`${record.path}-${record.createdAt}`} style={styles.historyRow}>
                <Text style={styles.historyFormat}>{record.format}</Text>
                <Text style={styles.historyPath}>{record.path}</Text>
              </View>
            ))
          )}
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
  bulletList: {
    marginTop: 14,
    gap: 8,
  },
  bullet: {
    color: moeTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  exportButton: {
    marginTop: 12,
    borderRadius: moeTheme.radius.pill,
    backgroundColor: moeTheme.colors.primaryStrong,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignSelf: 'flex-start',
  },
  exportButtonLabel: {
    color: '#FFF8FA',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    color: moeTheme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  historyRow: {
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
  },
  historyFormat: {
    color: moeTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyPath: {
    color: moeTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.9,
  },
})
