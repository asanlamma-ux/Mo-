import React from 'react'
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

import {moeShadow, moeTheme} from '@/theme/moeTheme'

interface MoeCardProps {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  accent?: boolean
}

export function MoeCard({
  title,
  subtitle,
  children,
  onPress,
  style,
  accent = false,
}: MoeCardProps): React.JSX.Element {
  const content = (
    <View style={[styles.card, accent ? styles.cardAccent : null, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: moeTheme.colors.surface,
    borderRadius: moeTheme.radius.lg,
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
    padding: moeTheme.spacing.lg,
    ...moeShadow,
  },
  cardAccent: {
    backgroundColor: moeTheme.colors.surfaceStrong,
  },
  pressed: {
    opacity: 0.92,
  },
  title: {
    color: moeTheme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: moeTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
})
