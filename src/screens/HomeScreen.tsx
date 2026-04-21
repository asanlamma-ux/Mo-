import React from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs'

import {MoeCard} from '@/components/MoeCard'
import {RevealView} from '@/components/RevealView'
import {RootTabParamList} from '@/navigation/AppNavigator'
import {useProjectStore} from '@/store/useProjectStore'
import {useStoryStore} from '@/store/useStoryStore'
import {moeTheme} from '@/theme/moeTheme'

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>

function MetricTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}): React.JSX.Element {
  return (
    <View style={styles.metricTile}>
      <Text style={[styles.metricValue, accent ? {color: accent} : null]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function ActionPill({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.actionPill, pressed ? styles.pressed : null]}>
      <Text style={styles.actionPillLabel}>{label}</Text>
    </Pressable>
  )
}

export function HomeScreen({navigation}: Props): React.JSX.Element {
  const document = useStoryStore(state => state.document)
  const permissionState = useProjectStore(state => state.permissionState)
  const recentProjects = useProjectStore(state => state.recentProjects)
  const exportHistory = useProjectStore(state => state.exportHistory)
  const leadDialogue = document.scenes[0]?.nodes.find(
    (node): node is Extract<(typeof document.scenes)[number]['nodes'][number], {type: 'dialogue'}> =>
      node.type === 'dialogue',
  )

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <RevealView delay={0}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.projectName}>{document.meta.name}</Text>
          </View>
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeIcon}>✦</Text>
          </View>
        </View>
      </RevealView>

      <RevealView delay={70}>
        <View style={styles.metricGrid}>
          <MetricTile label="Chapters" value={String(document.chapters.length)} accent={moeTheme.colors.primaryStrong} />
          <MetricTile label="Volumes" value={String(document.volumes.length)} />
          <MetricTile label="Assets" value={String(document.assets.length)} accent={moeTheme.colors.success} />
        </View>
      </RevealView>

      <RevealView delay={120}>
        <MoeCard
          accent
          subtitle={`Permission status: ${permissionState}. Workspace exports: ${exportHistory.length}.`}
          title="Studio workspace ready">
          <Text style={styles.cardBody}>
            Moe now boots into a writable studio workspace with project metadata, built-in VN UI settings, and package export hooks.
          </Text>
        </MoeCard>
      </RevealView>

      <RevealView delay={170}>
        <MoeCard subtitle="Jump into the workspace, file manager, or export flow." title="Quick actions">
          <View style={styles.actionRow}>
            <ActionPill label="Open workspace" onPress={() => navigation.navigate('Workspace')} />
            <ActionPill label="Manage files" onPress={() => navigation.navigate('Files')} />
            <ActionPill label="Export package" onPress={() => navigation.navigate('Export')} />
            <ActionPill label="Tune settings" onPress={() => navigation.navigate('Settings')} />
          </View>
        </MoeCard>
      </RevealView>

      <RevealView delay={220}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Continue Building</Text>
          <Pressable onPress={() => navigation.navigate('Workspace')}>
            <Text style={styles.sectionAction}>Open</Text>
          </Pressable>
        </View>
        <MoeCard
          onPress={() => navigation.navigate('Workspace')}
          subtitle={`Orientation ${document.parameters.orientation} • ${document.parameters.resolution[0]}x${document.parameters.resolution[1]}`}
          title={document.meta.name}>
          <Text style={styles.projectSnippet}>
            {leadDialogue?.text ??
              'Your workspace is ready for scene flow, assets, choices, logic, and preview configuration.'}
          </Text>
          <View style={styles.projectMetaRow}>
            <Text style={styles.projectMeta}>Recent projects: {recentProjects.length}</Text>
            <Text style={styles.projectMeta}>UI skin: {document.parameters.builtInUi.chatFrameStyle}</Text>
          </View>
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
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: moeTheme.colors.textMuted,
    fontSize: 22,
    marginBottom: 4,
  },
  projectName: {
    color: moeTheme.colors.text,
    fontSize: moeTheme.typography.hero,
    fontWeight: '800',
  },
  badgeCircle: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: moeTheme.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    color: moeTheme.colors.primary,
    fontSize: 34,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricTile: {
    flex: 1,
    backgroundColor: moeTheme.colors.surface,
    borderRadius: moeTheme.radius.lg,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  metricValue: {
    color: moeTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  metricLabel: {
    color: moeTheme.colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  cardBody: {
    color: moeTheme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionPill: {
    borderRadius: moeTheme.radius.pill,
    backgroundColor: moeTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionPillLabel: {
    color: '#FFF8FA',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: moeTheme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: moeTheme.colors.primaryStrong,
    fontSize: 16,
    fontWeight: '700',
  },
  projectSnippet: {
    color: moeTheme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  projectMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectMeta: {
    color: moeTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
})
