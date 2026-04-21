export interface TuesdayProjectJson
  extends Record<string, TuesdayTopLevelValue | undefined> {
  parameters: TuesdayParameters
  blocks: TuesdayBlocksMap
  base?: string[]
}

export type TuesdayTopLevelValue =
  | TuesdayParameters
  | TuesdayBlocksMap
  | TuesdayBlockScene
  | string[]

export interface TuesdayParameters {
  text_panel: TuesdayTextPanel
  name_panel?: TuesdayNamePanel
  title?: TuesdayLocalizedText
  launch_story?: string
  key?: Record<string, string>
  languares: string[]
  buttons?: TuesdayChoice[]
  style_file?: string
  autosave?: boolean
  font?: string
  font_size?: TuesdayCssValue
  variables?: Record<string, TuesdayVariableValue>
  sounds?: Record<string, string>
  characters?: Record<string, TuesdayCharacterDefinition>
  plugins?: string[]
  icon?: string
  font_files?: Record<string, string>
  resolutions?: [number, number, string?, string?]
  cursors?: Record<string, TuesdayCursorDefinition>
  gamepad?: Record<string, unknown>
  [key: string]: unknown
}

export interface TuesdayTextPanel {
  size?: TuesdaySize
  color?: string
  color_text?: string
  indent_text?: TuesdayCssValue
  indent_bottom?: TuesdayCssValue
  size_text?: TuesdayCssValue
  style?: string
  dialog_speed?: TuesdayCssValue
  art?: TuesdayLocalizedPath
  className?: string
  position?: TuesdayPosition
  font_family?: string
  scroll?: boolean
  show_all_text?: boolean
  end_text_cursor?: TuesdayCursorFrame
  art_align?: TuesdayAlign
  art_size?: TuesdayArtSize
  patch?: TuesdayBox4
  [key: string]: unknown
}

export interface TuesdayNamePanel {
  size?: TuesdaySize
  position?: TuesdayPosition4
  indent_text?: TuesdayCssValue
  size_text?: TuesdayCssValue
  color_text?: string
  align?: TuesdayFlexAlign
  art?: TuesdayLocalizedPath
  className?: string
  font_family?: string
  color?: string
  style?: string
  art_align?: TuesdayAlign
  art_size?: TuesdayArtSize
  patch?: TuesdayBox4
  [key: string]: unknown
}

export interface TuesdayCharacterDefinition {
  art?: TuesdayLocalizedPath
  color?: string
  color_text?: string
  className?: string
  style?: string
  font_family?: string
  size_text?: TuesdayCssValue
  indent_text?: TuesdayCssValue
  align?: TuesdayFlexAlign
  [languageCode: string]: unknown
}

export interface TuesdayCursorDefinition {
  0: string
  1: TuesdayCssValue
  2: TuesdayCssValue
  3?: TuesdayCssValue
}

export interface TuesdayBlocksMap {
  [blockId: string]: TuesdayBlockPlacement
}

export type TuesdayBlockPlacement = [
  TuesdayCssValue,
  TuesdayCssValue,
  string,
  boolean,
]

export type TuesdayBlockScene = TuesdayScene[]

export interface TuesdayScene {
  dialogs: TuesdayDialog[]
  background_color?: string
  background_class?: string
  background_image?: string | number | TuesdayLocalizedPath
  background_align?: string
  background_size?: TuesdayArtSize
  background_music?: string | number
  controll?: string
  [key: string]: unknown
}

export interface TuesdayDialog {
  text?: TuesdayLocalizedText
  text_add?: TuesdayLocalizedText
  name?: string | TuesdayInlineNameDefinition
  color?: string
  js?: string
  html?: string | TuesdayLocalizedText
  no_autosave?: boolean
  hide_interface?: boolean | string
  id_event?: string
  go_to?: string
  back_to?: string
  choice?: TuesdayChoice[]
  legacy_choice?: TuesdayLegacyChoiceRule[]
  variables?: TuesdayVariableMutation[]
  art?: TuesdayArtItem[]
  timer?: TuesdayTimer
  video?: TuesdayVideo
  sound?: string | TuesdayLocalizedPath
  sound_stop?: string | TuesdayLocalizedPath
  random_choice?: TuesdayRandomChoice[]
  end_text_cursor?: TuesdayCursorFrame
  [key: string]: unknown
}

export interface TuesdayInlineNameDefinition {
  color?: string
  color_text?: string
  className?: string
  style?: string
  art?: TuesdayLocalizedPath
  [languageCode: string]: unknown
}

export interface TuesdayChoice {
  go_to?: string
  url?: string
  position?: TuesdayPosition4
  size?: TuesdayNullableSize
  color?: string
  color_text?: string
  text?: TuesdayLocalizedText
  text1?: TuesdayLocalizedText
  text2?: TuesdayLocalizedText
  indent_text?: TuesdayCssValue
  art?: TuesdayLocalizedPath
  art1?: TuesdayLocalizedPath
  art2?: TuesdayLocalizedPath
  art_align?: TuesdayAlign
  art_size?: TuesdayArtSize
  patch?: TuesdayBox4
  sound?: TuesdayLocalizedPath
  sound_stop?: TuesdayLocalizedPath
  hotspot?: TuesdayHotspot
  angle?: TuesdayCssValue
  style?: string
  className?: string
  align?: TuesdayFlexAlign
  size_text?: TuesdayCssValue
  font_family?: string
  js?: string
  variables?: TuesdayVariableMutation[]
  show_if?: TuesdayShowIfRule[]
  delete?: boolean
  text_from?: boolean
  [key: string]: unknown
}

export interface TuesdayArtItem {
  file?: string | number | TuesdayLocalizedPath
  art?: TuesdayLocalizedPath
  position?: TuesdayPosition4
  size?: TuesdayNullableSize
  hotspot?: TuesdayHotspot
  angle?: TuesdayCssValue
  style?: string
  className?: string
  fit?: string
  time_transform?: number
  show_if?: TuesdayShowIfRule[]
  art_size?: TuesdayArtSize
  art_align?: TuesdayAlign
  patch?: TuesdayBox4
  [key: string]: unknown
}

export interface TuesdayVideo {
  url: string | TuesdayLocalizedPath
  fit?: 'contain' | 'position' | string
  size?: TuesdayNullableSize
  position?: TuesdayPosition4
  angle?: TuesdayCssValue
  style?: string
  className?: string
  loop?: boolean
  stop?: boolean
  autoplay?: boolean
  sound?: number
  time_start?: number
  time_end?: number
  go_to?: string
  [key: string]: unknown
}

export type TuesdayTimer = [number, string]

export type TuesdayRandomChoice = [string, string]

export type TuesdayLegacyChoiceRule =
  | [string, TuesdayLegacyOperator, TuesdayVariableValue, string]
  | {
      go_to?: string
      [key: string]: unknown
    }

export type TuesdayShowIfRule = [
  string,
  TuesdayLegacyOperator,
  TuesdayVariableValue,
]

export type TuesdayVariableMutation = [
  string,
  'add' | 'set',
  TuesdayVariableValue,
]

export type TuesdayLegacyOperator = '=' | '>' | '<'

export type TuesdayVariableValue = string | number | boolean | null

export type TuesdayLocalizedText =
  | string
  | number
  | Record<string, string | number>

export type TuesdayLocalizedPath = string | Record<string, string>

export type TuesdayCssValue = string | number

export type TuesdaySize = [TuesdayCssValue, TuesdayCssValue]

export type TuesdayNullableSize = [
  TuesdayCssValue | null,
  TuesdayCssValue | null,
]

export type TuesdayPosition = [
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue?,
]

export type TuesdayPosition4 = [
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
]

export type TuesdayHotspot = [TuesdayCssValue, TuesdayCssValue]

export type TuesdayFlexAlign = [string, string]

export type TuesdayAlign = [string, string]

export type TuesdayCursorFrame = [
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
]

export type TuesdayBox4 = [
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
  TuesdayCssValue,
]

export type TuesdayArtSize =
  | 'patch'
  | TuesdayCssValue
  | [TuesdayCssValue, TuesdayCssValue]
