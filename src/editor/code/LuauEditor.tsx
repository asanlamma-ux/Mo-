import React, {useMemo} from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import LuauBridge from '@/modules/LuauBridge'
import {moeTheme} from '@/theme/moeTheme'

interface LuauEditorProps {
  source: string
  onChangeSource: (source: string) => void
}

const snippets = [
  {
    label: 'Condition',
    value: 'if story.trust and story.trust > 2 then\n  story.route = "trust-route"\nend',
  },
  {
    label: 'Flag',
    value: 'story.flags = story.flags or {}\nstory.flags.metKai = true',
  },
  {
    label: 'Choice hook',
    value: 'return {\n  afterChoice = function(choiceId)\n    story.lastChoice = choiceId\n  end,\n}',
  },
]

export function LuauEditor({
  source,
  onChangeSource,
}: LuauEditorProps): React.JSX.Element {
  const validation = useMemo(() => LuauBridge.validate(source), [source])
  const completions = useMemo(() => LuauBridge.completions(source, source.length).slice(0, 4), [source])

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Luau logic</Text>
        <Text style={styles.meta}>{validation.ok ? 'No diagnostics' : `${validation.errors.length} diagnostics`}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.snippetBar}>
        <View style={styles.snippetRow}>
          {snippets.map(snippet => (
            <Pressable
              key={snippet.label}
              onPress={() => onChangeSource(`${source.trim()}\n\n${snippet.value}`.trim())}
              style={({pressed}) => [styles.snippetChip, pressed ? styles.pressed : null]}>
              <Text style={styles.snippetChipLabel}>{snippet.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <TextInput
        multiline
        onChangeText={onChangeSource}
        placeholder="Write Luau chapter hooks here"
        placeholderTextColor={moeTheme.colors.textMuted}
        style={styles.input}
        textAlignVertical="top"
        value={source}
      />

      <View style={styles.footerGrid}>
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Diagnostics</Text>
          {validation.errors.length === 0 ? (
            <Text style={styles.footerText}>The fallback bridge accepts the current draft. Native Luau validation will replace this when the JSI bridge is wired.</Text>
          ) : (
            validation.errors.map(error => (
              <Text key={`${error.line}:${error.col}:${error.message}`} style={styles.footerText}>
                {`L${error.line}:${error.col} ${error.message}`}
              </Text>
            ))
          )}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Suggested symbols</Text>
          {completions.length === 0 ? (
            <Text style={styles.footerText}>story, chapter, and runtime helpers will appear here once the native bridge exposes completions.</Text>
          ) : (
            completions.map(completion => (
              <Text key={completion.label} style={styles.footerText}>
                {completion.label} • {completion.kind}
              </Text>
            ))
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9FB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
    padding: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: moeTheme.colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  meta: {
    color: moeTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  snippetBar: {
    marginHorizontal: -2,
  },
  snippetRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  snippetChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: moeTheme.radius.pill,
    backgroundColor: moeTheme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  snippetChipLabel: {
    color: moeTheme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 220,
    borderRadius: 22,
    backgroundColor: '#FFFDFE',
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: moeTheme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  footerGrid: {
    gap: 10,
  },
  footerCard: {
    borderRadius: 18,
    backgroundColor: moeTheme.colors.surfaceStrong,
    padding: 14,
  },
  footerTitle: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  footerText: {
    color: moeTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.9,
  },
})
