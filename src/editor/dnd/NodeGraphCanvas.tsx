import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export function NodeGraphCanvas(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drag and drop graph canvas placeholder</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2c3447',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#adb6c7',
  },
})

