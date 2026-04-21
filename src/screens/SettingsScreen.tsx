import React from 'react'

import {ScreenScaffold} from '@/components/ScreenScaffold'

export function SettingsScreen(): React.JSX.Element {
  return (
    <ScreenScaffold
      title="Studio Settings"
      body="This screen will own project language, variables, sounds, plugins, and preview behavior once persistent settings are hooked up."
    />
  )
}

