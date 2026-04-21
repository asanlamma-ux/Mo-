import React from 'react'

import {ScreenScaffold} from '@/components/ScreenScaffold'

export function ExportScreen(): React.JSX.Element {
  return (
    <ScreenScaffold
      title="Export Targets"
      body="Planned outputs include Tuesday web bundles, raw JSON, and Luau source exports. Native package export is intentionally deferred."
    />
  )
}

