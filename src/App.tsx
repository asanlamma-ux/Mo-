import React from 'react'
import {NavigationContainer, DarkTheme} from '@react-navigation/native'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import {AppNavigator} from '@/navigation/AppNavigator'

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#11141c',
    card: '#171b26',
    border: '#2c3447',
    primary: '#f15a5a',
    text: '#f3f5f7',
  },
}

export function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

