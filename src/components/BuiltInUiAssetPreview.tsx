import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {
  BuiltInVectorAssetCatalog,
  BuiltInUiSkin,
} from '@/types/StoryDocument'
import {moeTheme} from '@/theme/moeTheme'

interface BuiltInUiAssetPreviewProps {
  catalog: BuiltInVectorAssetCatalog
  skin: BuiltInUiSkin
}

export function BuiltInUiAssetPreview({
  catalog,
  skin,
}: BuiltInUiAssetPreviewProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Chat frame</Text>
        <View style={[styles.chatFrame, {padding: skin.chatPadding}]}>
          <Text style={styles.previewAccent}>{skin.chatFrameStyle}</Text>
          <Text style={styles.previewText}>Moonlit choices can still feel calm if the shell stays light.</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Choice buttons</Text>
        <View style={styles.choiceStack}>
          <View style={[styles.choiceButton, skin.choiceStyle === 'card' ? styles.choiceCard : null]}>
            <Text style={styles.previewText}>Stay in the studio</Text>
          </View>
          <View
            style={[
              styles.choiceButton,
              skin.choiceStyle === 'glass' ? styles.choiceGlass : null,
            ]}>
            <Text style={styles.previewText}>Switch to rooftop route</Text>
          </View>
        </View>
      </View>

      <View style={styles.tokenWrap}>
        <Text style={styles.previewLabel}>Vector asset catalog</Text>
        {catalog.assets.map(asset => (
          <View key={asset.id} style={styles.tokenRow}>
            <Text style={styles.tokenName}>{asset.title}</Text>
            <Text style={styles.tokenMeta}>{asset.variant}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  previewCard: {
    borderRadius: 20,
    backgroundColor: '#FFFDFE',
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
    padding: 14,
  },
  previewLabel: {
    color: moeTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  chatFrame: {
    borderRadius: 24,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: '#E6C7D0',
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  previewAccent: {
    color: moeTheme.colors.primaryStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  previewText: {
    color: moeTheme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  choiceStack: {
    gap: 10,
  },
  choiceButton: {
    borderRadius: 999,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: '#E6C7D0',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  choiceCard: {
    borderRadius: 22,
    minHeight: 76,
    justifyContent: 'center',
  },
  choiceGlass: {
    backgroundColor: 'rgba(255, 249, 251, 0.74)',
  },
  tokenWrap: {
    borderRadius: 20,
    backgroundColor: moeTheme.colors.surfaceStrong,
    padding: 14,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: moeTheme.colors.border,
  },
  tokenName: {
    color: moeTheme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  tokenMeta: {
    color: moeTheme.colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
})
