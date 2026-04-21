import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack'

import {EditorScreen} from '@/screens/EditorScreen'
import {ExportScreen} from '@/screens/ExportScreen'
import {FileManagerScreen} from '@/screens/FileManagerScreen'
import {HomeScreen} from '@/screens/HomeScreen'
import {SettingsScreen} from '@/screens/SettingsScreen'

export type RootStackParamList = {
  Home: undefined
  Editor: undefined
  FileManager: undefined
  Settings: undefined
  Export: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {backgroundColor: '#171b26'},
        headerTintColor: '#f3f5f7',
        contentStyle: {backgroundColor: '#11141c'},
      }}>
      <Stack.Screen component={HomeScreen} name="Home" options={{title: 'Moe'}} />
      <Stack.Screen component={EditorScreen} name="Editor" options={{title: 'Editor'}} />
      <Stack.Screen component={FileManagerScreen} name="FileManager" options={{title: 'Files'}} />
      <Stack.Screen component={SettingsScreen} name="Settings" options={{title: 'Settings'}} />
      <Stack.Screen component={ExportScreen} name="Export" options={{title: 'Export'}} />
    </Stack.Navigator>
  )
}

