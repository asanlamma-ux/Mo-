import React from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'

import {BuiltInUiAssetPreview} from '@/components/BuiltInUiAssetPreview'
import {MoeCard} from '@/components/MoeCard'
import {RevealView} from '@/components/RevealView'
import {useProjectStore} from '@/store/useProjectStore'
import {useStoryStore} from '@/store/useStoryStore'
import {
  ChatFrameStyle,
  ChoiceStyle,
  MotionPreset,
  OrientationMode,
  SettingsStyle,
} from '@/types/StoryDocument'
import {moeTheme} from '@/theme/moeTheme'

function OptionChip({
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
        styles.optionChip,
        active ? styles.optionChipActive : null,
        pressed ? styles.pressed : null,
      ]}>
      <Text style={[styles.optionChipLabel, active ? styles.optionChipLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  )
}

function SettingRow({
  label,
  body,
  value,
}: {
  label: string
  body: string
  value: React.ReactNode
}): React.JSX.Element {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingBody}>{body}</Text>
      </View>
      <View>{value}</View>
    </View>
  )
}

export function SettingsScreen(): React.JSX.Element {
  const document = useStoryStore(state => state.document)
  const patchParameters = useStoryStore(state => state.patchParameters)
  const permissionState = useProjectStore(state => state.permissionState)
  const workspaceRoot = useProjectStore(state => state.workspaceRoot)

  const setOrientation = (orientation: OrientationMode): void => {
    patchParameters({orientation})
  }

  const patchSkin = (
    patch: Partial<typeof document.parameters.builtInUi>,
  ): void => {
    patchParameters({
      builtInUi: {
        ...document.parameters.builtInUi,
        ...patch,
      },
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <RevealView delay={0}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>Studio and runtime controls</Text>
        <Text style={styles.subtitle}>
          Configure orientation, built-in vector skins, motion, safe area, workspace state, and the shareable runtime surface.
        </Text>
      </RevealView>

      <RevealView delay={70}>
        <MoeCard
          subtitle={`Workspace: ${workspaceRoot ?? 'Not resolved'} • Permission: ${permissionState}`}
          title="Project runtime">
          <Text style={styles.groupLabel}>Orientation when playing</Text>
          <View style={styles.optionRow}>
            {(['portrait', 'landscape', 'adaptive'] as OrientationMode[]).map(option => (
              <OptionChip
                key={option}
                active={document.parameters.orientation === option}
                label={option}
                onPress={() => setOrientation(option)}
              />
            ))}
          </View>
          <Text style={styles.settingHint}>
            Players can change orientation later. The stored project package keeps this as runtime metadata instead of treating it as a one-time export choice.
          </Text>
        </MoeCard>
      </RevealView>

      <RevealView delay={120}>
        <MoeCard
          subtitle="Token-driven vector assets back the in-game chat frame, choice buttons, and settings shell."
          title="Built-in VN UI skin">
          <Text style={styles.groupLabel}>Chat padding</Text>
          <View style={styles.optionRow}>
            {[12, 16, 20, 24, 28].map(value => (
              <OptionChip
                key={value}
                active={document.parameters.builtInUi.chatPadding === value}
                label={`${value}px`}
                onPress={() => patchSkin({chatPadding: value})}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Chat frame</Text>
          <View style={styles.optionRow}>
            {(['petal', 'paper', 'glass'] as ChatFrameStyle[]).map(option => (
              <OptionChip
                key={option}
                active={document.parameters.builtInUi.chatFrameStyle === option}
                label={option}
                onPress={() => patchSkin({chatFrameStyle: option})}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Choice buttons</Text>
          <View style={styles.optionRow}>
            {(['pill', 'card', 'glass'] as ChoiceStyle[]).map(option => (
              <OptionChip
                key={option}
                active={document.parameters.builtInUi.choiceStyle === option}
                label={option}
                onPress={() => patchSkin({choiceStyle: option})}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Settings container</Text>
          <View style={styles.optionRow}>
            {(['sheet', 'sidebar'] as SettingsStyle[]).map(option => (
              <OptionChip
                key={option}
                active={document.parameters.builtInUi.settingsStyle === option}
                label={option}
                onPress={() => patchSkin({settingsStyle: option})}
              />
            ))}
          </View>

          <BuiltInUiAssetPreview
            catalog={document.builtInAssets}
            skin={document.parameters.builtInUi}
          />
        </MoeCard>
      </RevealView>

      <RevealView delay={170}>
        <MoeCard
          subtitle="Motion and safe-area defaults for the preview/runtime shell."
          title="Accessibility and motion">
          <SettingRow
            body="Keeps the in-game layout from colliding with notches and system bars."
            label="Safe area"
            value={
              <Switch
                onValueChange={value => patchSkin({safeAreaEnabled: value})}
                thumbColor="#FFF8FA"
                trackColor={{
                  false: moeTheme.colors.border,
                  true: moeTheme.colors.primary,
                }}
                value={document.parameters.builtInUi.safeAreaEnabled}
              />
            }
          />

          <Text style={styles.groupLabel}>Motion preset</Text>
          <View style={styles.optionRow}>
            {(['standard', 'reduced'] as MotionPreset[]).map(option => (
              <OptionChip
                key={option}
                active={document.parameters.builtInUi.motionPreset === option}
                label={option}
                onPress={() => patchSkin({motionPreset: option})}
              />
            ))}
          </View>
        </MoeCard>
      </RevealView>

      <RevealView delay={220}>
        <MoeCard
          subtitle="Current project inventory and Tuesday-facing feature surface."
          title="Authoring scope">
          <SettingRow
            body="Volume routing plus chapter-local graph execution."
            label="Workspace graph"
            value={<Text style={styles.settingValue}>{document.chapters.length} chapters</Text>}
          />
          <SettingRow
            body="Imported backgrounds, sprites, music, SFX, video, and UI pieces."
            label="Asset library"
            value={<Text style={styles.settingValue}>{document.assets.length} assets</Text>}
          />
          <SettingRow
            body="Route variables and typed defaults used for conditions and progression."
            label="Variables"
            value={<Text style={styles.settingValue}>{document.variables.length}</Text>}
          />
          <SettingRow
            body="Vector catalog entries exported with the project package."
            label="Built-in assets"
            value={<Text style={styles.settingValue}>{document.builtInAssets.assets.length}</Text>}
          />
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
  groupLabel: {
    color: moeTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  optionChip: {
    borderRadius: moeTheme.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: moeTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  optionChipActive: {
    backgroundColor: moeTheme.colors.primaryStrong,
    borderColor: moeTheme.colors.primaryStrong,
  },
  optionChipLabel: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  optionChipLabelActive: {
    color: '#FFF8FA',
  },
  settingHint: {
    color: moeTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: moeTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  settingBody: {
    color: moeTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  settingValue: {
    color: moeTheme.colors.primaryStrong,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.9,
  },
})
