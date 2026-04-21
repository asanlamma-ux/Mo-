import React, {useMemo} from 'react'
import {StyleSheet, View} from 'react-native'
import {WebView} from 'react-native-webview'

import {SceneNode, StoryDocument} from '@/types/StoryDocument'

export interface TuesdayEvent {
  type: string
  [key: string]: unknown
}

interface TuesdayPreviewProps {
  document: StoryDocument
  selectedSceneId?: string
  onEvent?: (event: TuesdayEvent) => void
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function findRenderableNode(nodes: SceneNode[]): Extract<SceneNode, {type: 'dialogue' | 'choice'}> | null {
  for (const node of nodes) {
    if (node.type === 'dialogue' || node.type === 'choice') {
      return node
    }
  }

  return null
}

function createPreviewHtml(document: StoryDocument, selectedSceneId?: string): string {
  const scene =
    document.scenes.find(item => item.id === selectedSceneId) ??
    document.scenes[0]
  const builtInUi = document.parameters.builtInUi
  const vectorMap = Object.fromEntries(document.builtInAssets.assets.map(asset => [asset.id, asset.svg]))
  const activeNode = scene ? findRenderableNode(scene.nodes) : null
  const dialogueText =
    activeNode?.type === 'dialogue'
      ? activeNode.text
      : 'Preview the selected chapter here. Built-in chat chrome, choices, and spacing follow the current project skin.'
  const speaker =
    activeNode?.type === 'dialogue'
      ? activeNode.speaker || document.characters[0]?.name || document.meta.name
      : scene?.label ?? document.meta.name
  const choices =
    activeNode?.type === 'choice'
      ? activeNode.options
      : [
          {text: 'Preview story route', jump: 'story'},
          {text: 'Inspect UI skin', jump: 'settings'},
        ]
  const width = document.parameters.orientation === 'landscape' ? 820 : 420
  const height = document.parameters.orientation === 'landscape' ? 420 : 760

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      :root {
        --bg: #1f2230;
        --panel: rgba(255, 249, 251, 0.94);
        --text: #4b2b36;
        --text-muted: #8f6674;
        --accent: #b65072;
        --accent-soft: #f7d7df;
        --border: #ead8de;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, #1d2130 0%, #252938 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: white;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
      }
      .device {
        width: ${width}px;
        height: ${height}px;
        border-radius: 34px;
        background:
          radial-gradient(circle at top right, rgba(182, 80, 114, 0.16), transparent 28%),
          linear-gradient(180deg, rgba(35, 39, 55, 0.88), rgba(17, 20, 28, 0.94));
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow: 0 30px 60px rgba(0,0,0,0.35);
      }
      .safe-area {
        position: absolute;
        inset: ${builtInUi.safeAreaEnabled ? 18 : 0}px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .hud {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 4px 4px 0;
      }
      .hud-left {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .eyebrow {
        color: rgba(255, 230, 237, 0.76);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.4px;
        text-transform: uppercase;
      }
      .scene-title {
        font-size: 24px;
        font-weight: 800;
      }
      .chip {
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        color: rgba(255, 240, 245, 0.88);
        font-size: 12px;
      }
      .dialog-shell {
        position: relative;
        padding: 0 0 10px;
      }
      .dialog-svg {
        width: 100%;
        height: 188px;
        object-fit: fill;
        display: block;
      }
      .dialog-content {
        position: absolute;
        left: ${builtInUi.chatPadding}px;
        right: ${builtInUi.chatPadding}px;
        bottom: 24px;
        color: var(--text);
      }
      .speaker {
        font-size: 15px;
        font-weight: 800;
        color: var(--accent);
        letter-spacing: 0.4px;
        margin-bottom: 8px;
      }
      .dialogue {
        font-size: 16px;
        line-height: 24px;
        color: var(--text);
      }
      .choice-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 14px;
      }
      .choice-button {
        border: 0;
        width: 100%;
        background: transparent;
        padding: 0;
        text-align: left;
      }
      .choice-shell {
        position: relative;
        min-height: ${builtInUi.choiceStyle === 'card' ? 94 : 72}px;
      }
      .choice-shell img {
        width: 100%;
        height: 100%;
        display: block;
      }
      .choice-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 24px;
        font-size: 15px;
        font-weight: 700;
        color: var(--text);
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        color: rgba(255, 240, 245, 0.74);
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="device">
      <div class="safe-area">
        <div class="hud">
          <div class="hud-left">
            <div class="eyebrow">${escapeHtml(document.meta.name)}</div>
            <div class="scene-title">${escapeHtml(scene?.label ?? 'Preview')}</div>
          </div>
          <div class="chip">${escapeHtml(document.parameters.orientation)}</div>
        </div>

        <div class="dialog-shell">
          <img class="dialog-svg" alt="" src="data:image/svg+xml;utf8,${encodeURIComponent(vectorMap['chat-frame'] ?? '')}" />
          <div class="dialog-content">
            <div class="speaker">${escapeHtml(speaker)}</div>
            <div class="dialogue">${escapeHtml(dialogueText)}</div>
            <div class="choice-stack">
              ${choices
                .map(
                  choice => `
                    <button class="choice-button" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'choice_selected', jump:'${escapeHtml(choice.jump)}'}))">
                      <div class="choice-shell">
                        <img alt="" src="data:image/svg+xml;utf8,${encodeURIComponent(
                          vectorMap[document.parameters.builtInUi.choiceStyle === 'card' ? 'choice-card' : 'choice-pill'] ?? '',
                        )}" />
                        <div class="choice-label">${escapeHtml(choice.text)}</div>
                      </div>
                    </button>
                  `,
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="footer">
          <div>${escapeHtml(document.parameters.builtInUi.chatFrameStyle)} frame</div>
          <div>${escapeHtml(document.parameters.builtInUi.motionPreset)} motion</div>
        </div>
      </div>
    </div>
  </body>
</html>`
}

export function TuesdayPreview({
  document,
  selectedSceneId,
  onEvent,
}: TuesdayPreviewProps): React.JSX.Element {
  const html = useMemo(
    () => createPreviewHtml(document, selectedSceneId),
    [document, selectedSceneId],
  )

  return (
    <View style={styles.container}>
      <WebView
        onMessage={event => onEvent?.(JSON.parse(event.nativeEvent.data))}
        originWhitelist={['*']}
        scrollEnabled={false}
        source={{html}}
        style={styles.webview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 420,
    borderRadius: 24,
    overflow: 'hidden',
  },
  webview: {
    minHeight: 420,
    backgroundColor: '#171b26',
  },
})
