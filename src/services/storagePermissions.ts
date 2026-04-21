import {
  Alert,
  Linking,
  Permission,
  PermissionStatus,
  PermissionsAndroid,
  Platform,
} from 'react-native'

export type StoragePermissionState = 'unknown' | 'granted' | 'denied' | 'blocked'

function getAndroidPermissions(): Permission[] {
  const androidVersion: number =
    typeof Platform.Version === 'number' ? Platform.Version : Number(Platform.Version)

  if (androidVersion >= 33) {
    return [
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    ]
  }

  return [
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ]
}

export async function requestStudioStoragePermission(): Promise<StoragePermissionState> {
  if (Platform.OS !== 'android') {
    return 'granted'
  }

  const permissions: Permission[] = getAndroidPermissions()
  const result: Record<string, PermissionStatus> =
    await PermissionsAndroid.requestMultiple(permissions)

  const values: PermissionStatus[] = permissions.map(
    permission => result[permission],
  )

  if (values.every(value => value === PermissionsAndroid.RESULTS.GRANTED)) {
    return 'granted'
  }

  if (values.some(value => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
    return 'blocked'
  }

  return 'denied'
}

export function promptForAppSettings(): void {
  Alert.alert(
    'Storage access required',
    'Moe needs media and storage access to open project folders, import assets, and export shareable zip packages.',
    [
      {text: 'Not now', style: 'cancel'},
      {text: 'Open settings', onPress: () => Linking.openSettings()},
    ],
  )
}
