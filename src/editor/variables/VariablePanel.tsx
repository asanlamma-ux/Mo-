import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

export function VariablePanel(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Variables</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    color: '#f3f5f7',
    fontSize: 18,
    fontWeight: '700',
  },
})

