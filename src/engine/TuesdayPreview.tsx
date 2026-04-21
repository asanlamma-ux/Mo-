import React from 'react'
import {StyleSheet, View} from 'react-native'
import {WebView} from 'react-native-webview'

export interface TuesdayEvent {
  type: string
  [key: string]: unknown
}

interface TuesdayPreviewProps {
  storyJson: string
  startSceneId?: string
  onEvent?: (event: TuesdayEvent) => void
}

export function TuesdayPreview({
  storyJson,
  startSceneId,
  onEvent,
}: TuesdayPreviewProps): React.JSX.Element {
  const injectedJavaScript = `
    window.__MOE_STORY_JSON__ = ${JSON.stringify(storyJson)};
    window.__MOE_START_SCENE_ID__ = ${JSON.stringify(startSceneId ?? null)};
    true;
  `

  return (
    <View style={styles.container}>
      <WebView
        source={{html: '<html><body style="margin:0;background:#11141c;"></body></html>'}}
        injectedJavaScript={injectedJavaScript}
        onMessage={event => onEvent?.(JSON.parse(event.nativeEvent.data))}
        style={styles.webview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#11141c',
  },
})

