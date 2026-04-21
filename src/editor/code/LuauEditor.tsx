import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export function LuauEditor(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Luau editor placeholder</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171b26',
    borderRadius: 16,
    padding: 16,
  },
  text: {
    color: '#f3f5f7',
    fontSize: 16,
  },
})

