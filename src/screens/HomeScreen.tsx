import React from 'react'
import {NativeStackScreenProps} from '@react-navigation/native-stack'

import {ScreenScaffold} from '@/components/ScreenScaffold'
import {RootStackParamList} from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export function HomeScreen({navigation}: Props): React.JSX.Element {
  return (
    <ScreenScaffold
      title="Start The Studio"
      body="Phase 1 is bootstrapped. The next concrete layers are story modeling, Tuesday serialization, and native Luau bridge integration."
      actions={[
        {label: 'Open Editor', onPress: () => navigation.navigate('Editor')},
        {label: 'Files', onPress: () => navigation.navigate('FileManager')},
        {label: 'Settings', onPress: () => navigation.navigate('Settings')},
      ]}
    />
  )
}

