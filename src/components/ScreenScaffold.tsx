import React from 'react'
import {Pressable, StyleSheet, Text, View} from 'react-native'

export interface ScreenScaffoldAction {
  label: string
  onPress: () => void
}

interface ScreenScaffoldProps {
  title: string
  body: string
  actions?: ScreenScaffoldAction[]
}

export function ScreenScaffold({
  title,
  body,
  actions = [],
}: ScreenScaffoldProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Moe Visual Novel Studio</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.actions}>
        {actions.map(action => (
          <Pressable key={action.label} onPress={action.onPress} style={styles.action}>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#11141c',
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#f15a5a',
    fontSize: 12,
    letterSpacing: 1.4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f3f5f7',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#adb6c7',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  action: {
    borderWidth: 1,
    borderColor: '#2c3447',
    borderRadius: 14,
    backgroundColor: '#171b26',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionLabel: {
    color: '#f3f5f7',
    fontSize: 15,
    fontWeight: '600',
  },
})

