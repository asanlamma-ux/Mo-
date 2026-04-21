import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export function EditorScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.project}>Untitled Project</Text>
        <Text style={styles.mode}>Design</Text>
      </View>
      <View style={styles.canvas}>
        <Text style={styles.title}>Editor foundation ready</Text>
        <Text style={styles.body}>
          The real next step is wiring a normalized MoeStoryDocument to the exact TuesdayProjectJson contract.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11141c',
  },
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: '#2c3447',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  project: {
    color: '#f3f5f7',
    fontSize: 18,
    fontWeight: '700',
  },
  mode: {
    color: '#f15a5a',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  canvas: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#f3f5f7',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#adb6c7',
    fontSize: 16,
    lineHeight: 24,
  },
})

