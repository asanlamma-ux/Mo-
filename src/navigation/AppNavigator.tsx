import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {StyleSheet, Text} from 'react-native'

import {EditorScreen} from '@/screens/EditorScreen'
import {ExportScreen} from '@/screens/ExportScreen'
import {FileManagerScreen} from '@/screens/FileManagerScreen'
import {HomeScreen} from '@/screens/HomeScreen'
import {SettingsScreen} from '@/screens/SettingsScreen'
import {moeTheme} from '@/theme/moeTheme'

export type RootTabParamList = {
  Home: undefined
  Workspace: undefined
  Files: undefined
  Export: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

const tabIcons: Record<keyof RootTabParamList, string> = {
  Home: '⌂',
  Workspace: '▣',
  Files: '▤',
  Export: '⇪',
  Settings: '⚙',
}

function TabIcon({
  routeName,
  color,
}: {
  routeName: keyof RootTabParamList
  color: string
}): React.JSX.Element {
  return <Text style={[styles.icon, {color}]}>{tabIcons[routeName]}</Text>
}

export function AppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: moeTheme.colors.primaryStrong,
        tabBarInactiveTintColor: moeTheme.colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({color}) => (
          <TabIcon routeName={route.name as keyof RootTabParamList} color={color} />
        ),
      })}>
      <Tab.Screen component={HomeScreen} name="Home" options={{title: 'Home'}} />
      <Tab.Screen component={EditorScreen} name="Workspace" options={{title: 'Workspace'}} />
      <Tab.Screen component={FileManagerScreen} name="Files" options={{title: 'Files'}} />
      <Tab.Screen component={ExportScreen} name="Export" options={{title: 'Export'}} />
      <Tab.Screen component={SettingsScreen} name="Settings" options={{title: 'Settings'}} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  tabBar: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 249, 251, 0.96)',
    borderTopWidth: 1,
    borderTopColor: moeTheme.colors.border,
  },
  tabItem: {
    paddingVertical: 2,
  },
})
