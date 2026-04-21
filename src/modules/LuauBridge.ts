export interface LuauError {
  line: number
  col: number
  message: string
  severity: 'error' | 'warning'
}

export interface Completion {
  label: string
  kind: 'function' | 'variable' | 'keyword'
  detail: string
}

declare global {
  var luau:
    | {
        validate: (source: string) => {ok: boolean; errors: LuauError[]}
        compile: (source: string) => {ok: boolean; json: string; errors: LuauError[]}
        format: (source: string) => string
        completions: (source: string, cursorPos: number) => Completion[]
      }
    | undefined
}

const fallbackBridge = {
  validate: () => ({ok: false, errors: [{line: 1, col: 1, message: 'Luau bridge not installed', severity: 'warning' as const}]}),
  compile: () => ({ok: false, json: '', errors: [{line: 1, col: 1, message: 'Luau bridge not installed', severity: 'warning' as const}]}),
  format: (source: string) => source,
  completions: () => [] as Completion[],
}

const LuauBridge = global.luau ?? fallbackBridge

export default LuauBridge

