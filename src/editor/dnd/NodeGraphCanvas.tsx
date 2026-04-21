import React, {useMemo} from 'react'
import {StyleSheet, View} from 'react-native'
import {WebView} from 'react-native-webview'

import {
  ChapterGraph,
  ChapterGraphNodeType,
  GraphPosition,
  TimelineLaneId,
} from '@/types/StoryDocument'
import {moeTheme} from '@/theme/moeTheme'

interface NodeGraphCanvasProps {
  graph: ChapterGraph
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onMoveNode: (nodeId: string, position: GraphPosition) => void
}

interface GraphBridgeEvent {
  type: 'node_selected' | 'node_moved'
  nodeId: string
  position?: GraphPosition
}

const laneOrder: TimelineLaneId[] = ['story', 'media', 'logic']

const nodeColors: Record<ChapterGraphNodeType, string> = {
  start: '#7E5CEF',
  dialogue: '#B65072',
  choice: '#D96C86',
  condition: '#E07F45',
  jump: '#8968D2',
  background: '#6BA4A1',
  music: '#629169',
  sfx: '#4B90A6',
  set: '#A97857',
  wait: '#7C8AA8',
  code: '#5B4D7A',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createGraphHtml(graph: ChapterGraph, selectedNodeId: string | null): string {
  const lanes = laneOrder
    .map((lane, index) => {
      const top = 24 + index * 176
      return [
        `<div class="lane lane-${lane}" style="top:${top}px;">`,
        `<div class="lane-label">${escapeHtml(lane.toUpperCase())}</div>`,
        '</div>',
      ].join('')
    })
    .join('')

  const nodeMarkup = graph.nodes
    .map(node => {
      const color = nodeColors[node.type]
      const isSelected = node.id === selectedNodeId
      const subtitle =
        node.payload.text ??
        node.payload.variable ??
        node.payload.target ??
        node.payload.image ??
        node.payload.file ??
        ''

      return [
        `<div class="node ${isSelected ? 'node-selected' : ''}" data-node-id="${escapeHtml(node.id)}" style="left:${node.position.x}px; top:${node.position.y}px; --node-color:${color};">`,
        `<div class="node-type">${escapeHtml(node.type)}</div>`,
        `<div class="node-title">${escapeHtml(node.title)}</div>`,
        `<div class="node-subtitle">${escapeHtml(subtitle.slice(0, 90))}</div>`,
        '</div>',
      ].join('')
    })
    .join('')

  const edgeMarkup = graph.edges
    .map(edge => {
      const source = graph.nodes.find(node => node.id === edge.source)
      const target = graph.nodes.find(node => node.id === edge.target)

      if (!source || !target) {
        return ''
      }

      const x1 = source.position.x + 168
      const y1 = source.position.y + 44
      const x2 = target.position.x
      const y2 = target.position.y + 44
      const controlX = (x1 + x2) / 2
      const path = `M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`
      const labelX = controlX
      const labelY = y1 + (y2 - y1) / 2 - 8

      return [
        `<path d="${path}" class="edge" />`,
        edge.label
          ? `<text x="${labelX}" y="${labelY}" class="edge-label">${escapeHtml(edge.label)}</text>`
          : '',
      ].join('')
    })
    .join('')

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background: ${moeTheme.colors.surfaceStrong};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #canvas {
        position: relative;
        width: 1480px;
        height: 620px;
        background:
          linear-gradient(${moeTheme.colors.backgroundAccent} 1px, transparent 1px),
          linear-gradient(90deg, ${moeTheme.colors.backgroundAccent} 1px, transparent 1px);
        background-size: 24px 24px;
      }
      .lane {
        position: absolute;
        left: 18px;
        right: 18px;
        height: 148px;
        border-radius: 30px;
        border: 1px solid ${moeTheme.colors.border};
        background: rgba(255, 249, 251, 0.82);
        box-shadow: 0 16px 30px rgba(97, 53, 70, 0.08);
      }
      .lane-label {
        position: absolute;
        left: 18px;
        top: 16px;
        color: ${moeTheme.colors.textMuted};
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.3px;
      }
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .edge {
        fill: none;
        stroke: rgba(108, 91, 123, 0.45);
        stroke-width: 3;
      }
      .edge-label {
        fill: ${moeTheme.colors.textMuted};
        font-size: 12px;
        font-weight: 700;
        text-anchor: middle;
      }
      .node {
        position: absolute;
        width: 168px;
        min-height: 88px;
        border-radius: 24px;
        background: #fff9fb;
        border: 1px solid rgba(75, 43, 54, 0.08);
        box-shadow: 0 16px 32px rgba(97, 53, 70, 0.12);
        padding: 14px 14px 12px;
        box-sizing: border-box;
        user-select: none;
        touch-action: none;
      }
      .node::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 8px;
        border-radius: 24px 0 0 24px;
        background: var(--node-color);
      }
      .node-selected {
        outline: 3px solid rgba(182, 80, 114, 0.2);
        border-color: rgba(182, 80, 114, 0.35);
      }
      .node-type {
        color: var(--node-color);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        margin-bottom: 6px;
        padding-left: 6px;
      }
      .node-title {
        color: ${moeTheme.colors.text};
        font-size: 15px;
        font-weight: 800;
        line-height: 19px;
        padding-left: 6px;
      }
      .node-subtitle {
        color: ${moeTheme.colors.textMuted};
        font-size: 12px;
        line-height: 16px;
        margin-top: 8px;
        padding-left: 6px;
      }
    </style>
  </head>
  <body>
    <div id="canvas">
      ${lanes}
      <svg viewBox="0 0 1480 620" preserveAspectRatio="none">${edgeMarkup}</svg>
      ${nodeMarkup}
    </div>
    <script>
      const bridge = window.ReactNativeWebView
      const canvas = document.getElementById('canvas')
      const nodeElements = Array.from(document.querySelectorAll('.node'))
      let dragState = null

      function postMessage(payload) {
        if (!bridge) return
        bridge.postMessage(JSON.stringify(payload))
      }

      nodeElements.forEach(node => {
        node.addEventListener('pointerdown', event => {
          const rect = canvas.getBoundingClientRect()
          const nodeRect = node.getBoundingClientRect()
          dragState = {
            nodeId: node.dataset.nodeId,
            offsetX: event.clientX - nodeRect.left,
            offsetY: event.clientY - nodeRect.top,
            boundsLeft: rect.left,
            boundsTop: rect.top,
          }
          node.setPointerCapture(event.pointerId)
          postMessage({type: 'node_selected', nodeId: node.dataset.nodeId})
        })

        node.addEventListener('pointermove', event => {
          if (!dragState || dragState.nodeId !== node.dataset.nodeId) return
          const nextX = Math.max(16, event.clientX - dragState.boundsLeft - dragState.offsetX)
          const nextY = Math.max(20, event.clientY - dragState.boundsTop - dragState.offsetY)
          node.style.left = nextX + 'px'
          node.style.top = nextY + 'px'
        })

        node.addEventListener('pointerup', event => {
          if (!dragState || dragState.nodeId !== node.dataset.nodeId) return
          const nextX = Math.round(parseFloat(node.style.left))
          const nextY = Math.round(parseFloat(node.style.top))
          node.releasePointerCapture(event.pointerId)
          postMessage({
            type: 'node_moved',
            nodeId: node.dataset.nodeId,
            position: {x: nextX, y: nextY},
          })
          dragState = null
        })
      })
    </script>
  </body>
</html>`
}

export function NodeGraphCanvas({
  graph,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
}: NodeGraphCanvasProps): React.JSX.Element {
  const html = useMemo(() => createGraphHtml(graph, selectedNodeId), [graph, selectedNodeId])

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        onMessage={event => {
          const payload = JSON.parse(event.nativeEvent.data) as GraphBridgeEvent

          if (payload.type === 'node_selected') {
            onSelectNode(payload.nodeId)
            return
          }

          if (payload.type === 'node_moved' && payload.position) {
            onMoveNode(payload.nodeId, payload.position)
          }
        }}
        scrollEnabled={false}
        source={{html}}
        style={styles.webview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 620,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: moeTheme.colors.border,
  },
  webview: {
    minHeight: 620,
    backgroundColor: moeTheme.colors.surfaceStrong,
  },
})
