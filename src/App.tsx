import React, {startTransition, useEffect, useState} from 'react'
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {NavigationContainer, DefaultTheme} from '@react-navigation/native'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import {AppNavigator} from '@/navigation/AppNavigator'
import {
  promptForAppSettings,
  requestStudioStoragePermission,
} from '@/services/storagePermissions'
import {useProjectStore} from '@/store/useProjectStore'
import {useStoryStore} from '@/store/useStoryStore'
import {moeTheme} from '@/theme/moeTheme'
import {VnprojManager} from '@/utils/vnprojManager'

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: moeTheme.colors.background,
    card: moeTheme.colors.surface,
    border: moeTheme.colors.border,
    primary: moeTheme.colors.primary,
    text: moeTheme.colors.text,
  },
}

export function App(): React.JSX.Element {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const setDocument = useStoryStore(state => state.setDocument)
  const setActiveProjectPath = useProjectStore(state => state.setActiveProjectPath)
  const setRecentProjects = useProjectStore(state => state.setRecentProjects)
  const setPermissionState = useProjectStore(state => state.setPermissionState)
  const setWorkspaceRoot = useProjectStore(state => state.setWorkspaceRoot)
  const addRecentProject = useProjectStore(state => state.addRecentProject)

  useEffect(() => {
    let isMounted = true

    const synchronizeStudio = async (showLoader: boolean): Promise<void> => {
      if (showLoader && isMounted) {
        startTransition(() => {
          setIsBootstrapping(true)
        })
      }

      const permissionState = await requestStudioStoragePermission()

      if (!isMounted) {
        return
      }

      setPermissionState(permissionState)

      if (permissionState === 'blocked') {
        promptForAppSettings()
      }

      const workspaceRoot = await VnprojManager.ensureWorkspace()
      const snapshot = await VnprojManager.bootstrapWorkspace()
      const projects = await VnprojManager.listProjects()

      if (!isMounted) {
        return
      }

      setWorkspaceRoot(workspaceRoot)
      setDocument(snapshot.document)
      setActiveProjectPath(snapshot.project.path)
      addRecentProject(snapshot.project)
      setRecentProjects(projects)
      setIsBootstrapping(false)
    }

    void synchronizeStudio(true)

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        void synchronizeStudio(false)
      }
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [
    addRecentProject,
    setActiveProjectPath,
    setDocument,
    setPermissionState,
    setRecentProjects,
    setWorkspaceRoot,
  ])

  if (isBootstrapping) {
    return (
      <SafeAreaProvider>
        <View style={styles.bootContainer}>
          <ActivityIndicator color={moeTheme.colors.primaryStrong} size="large" />
          <Text style={styles.bootTitle}>Preparing Moe Studio</Text>
          <Text style={styles.bootBody}>
            Requesting storage access, scanning the workspace, and loading your latest visual novel project.
          </Text>
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: moeTheme.colors.background,
  },
  bootTitle: {
    marginTop: 20,
    marginBottom: 10,
    color: moeTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  bootBody: {
    color: moeTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
})
