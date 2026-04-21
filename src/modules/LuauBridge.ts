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

interface LuauBridgeApi {
  validate: (source: string) => {ok: boolean; errors: LuauError[]}
  compile: (source: string) => {ok: boolean; json: string; errors: LuauError[]}
  format: (source: string) => string
  completions: (source: string, cursorPos: number) => Completion[]
}

declare global {
  var luau: LuauBridgeApi | undefined
}

const fallbackSymbols: Completion[] = [
  {label: 'story', kind: 'variable', detail: 'Runtime story state table'},
  {label: 'chapter', kind: 'variable', detail: 'Current chapter metadata'},
  {label: 'runtime', kind: 'variable', detail: 'Preview/runtime helpers'},
  {label: 'if', kind: 'keyword', detail: 'Conditional branch'},
  {label: 'function', kind: 'keyword', detail: 'Function declaration'},
  {label: 'pairs', kind: 'function', detail: 'Iterate table key-value pairs'},
  {label: 'ipairs', kind: 'function', detail: 'Iterate array-like table values'},
  {label: 'math', kind: 'variable', detail: 'Standard math library'},
]

function getLineAndColumn(source: string, index: number): {line: number; col: number} {
  const prefix = source.slice(0, index)
  const lines = prefix.split('\n')
  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1,
  }
}

function validateFallbackSource(source: string): LuauError[] {
  const errors: LuauError[] = []
  const openingKeywords = source.match(/\b(function|if|for|while|do)\b/g)?.length ?? 0
  const endKeywords = source.match(/\bend\b/g)?.length ?? 0

  if (openingKeywords > endKeywords) {
    errors.push({
      line: Math.max(source.split('\n').length, 1),
      col: 1,
      message: 'Possible missing `end` token in Luau block structure',
      severity: 'error',
    })
  }

  let parenDepth = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (character === '(') {
      parenDepth += 1
    }

    if (character === ')') {
      parenDepth -= 1

      if (parenDepth < 0) {
        const position = getLineAndColumn(source, index)
        errors.push({
          line: position.line,
          col: position.col,
          message: 'Unexpected closing parenthesis',
          severity: 'error',
        })
        parenDepth = 0
      }
    }
  }

  if (parenDepth > 0) {
    errors.push({
      line: Math.max(source.split('\n').length, 1),
      col: 1,
      message: 'Unclosed parenthesis in Luau source',
      severity: 'error',
    })
  }

  return errors
}

function formatFallbackSource(source: string): string {
  return source
    .split('\n')
    .map(line => line.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getCurrentToken(source: string, cursorPos: number): string {
  const prefix = source.slice(0, cursorPos)
  const match = prefix.match(/[A-Za-z_][A-Za-z0-9_]*$/)
  return match?.[0] ?? ''
}

const fallbackBridge: LuauBridgeApi = {
  validate: source => {
    const errors = validateFallbackSource(source)
    return {ok: errors.length === 0, errors}
  },
  compile: source => {
    const errors = validateFallbackSource(source)

    if (errors.length > 0) {
      return {ok: false, json: '', errors}
    }

    return {
      ok: true,
      json: JSON.stringify(
        {
          ok: true,
          compiler: 'fallback-luau-bridge',
          source,
        },
        null,
        2,
      ),
      errors: [],
    }
  },
  format: formatFallbackSource,
  completions: (source, cursorPos) => {
    const token = getCurrentToken(source, cursorPos).toLowerCase()

    if (!token) {
      return fallbackSymbols
    }

    return fallbackSymbols.filter(symbol =>
      symbol.label.toLowerCase().startsWith(token),
    )
  },
}

const runtimeGlobal: typeof globalThis & {luau?: LuauBridgeApi} = globalThis
const LuauBridge: LuauBridgeApi = runtimeGlobal.luau ?? fallbackBridge

export default LuauBridge
