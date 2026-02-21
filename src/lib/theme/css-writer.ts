import { PRESERVED_VARIABLES } from './bridge-map'

// Rewrites color variables inside :root or .dark blocks in globals.css.
// Preserves everything else: imports, @theme inline, body, animations, etc.
export function rewriteGlobalsCss(
  cssContent: string,
  mode: 'light' | 'dark',
  colorVars: Record<string, string>,
): string {
  const selector = mode === 'light' ? ':root' : '.dark'
  const blockRegex =
    mode === 'light'
      ? /(:root\s*\{)([\s\S]*?)(\})/
      : /(\.dark\s*\{)([\s\S]*?)(\})/

  const match = cssContent.match(blockRegex)
  if (!match) {
    throw new Error(`Could not find "${selector}" block in globals.css`)
  }

  const [fullMatch, opener, body, closer] = match

  // Parse existing lines in the block
  const lines = body.split('\n')
  const newLines: string[] = []

  // Track which variables we've written so we can append any new ones
  const written = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()

    // Blank lines and comments pass through
    if (trimmed === '' || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      newLines.push(line)
      continue
    }

    // Match CSS variable declarations: --name: value;
    const varMatch = trimmed.match(/^(--[\w-]+):\s*(.+);$/)
    if (!varMatch) {
      newLines.push(line)
      continue
    }

    const varName = varMatch[1]

    // Preserve non-color variables (radius, fonts, etc.)
    if (PRESERVED_VARIABLES.some((p) => varName.startsWith(p))) {
      newLines.push(line)
      continue
    }

    // Replace with new value if we have one, otherwise keep original
    if (colorVars[varName] !== undefined) {
      // Detect existing indentation
      const indent = line.match(/^(\s*)/)?.[1] ?? '  '
      newLines.push(`${indent}${varName}: ${colorVars[varName]};`)
      written.add(varName)
    } else {
      newLines.push(line)
    }
  }

  // Append any variables from the map that weren't in the original block
  const unwritten = Object.entries(colorVars).filter(
    ([key]) => !written.has(key),
  )
  if (unwritten.length > 0) {
    // Insert before the last line (which is likely empty/whitespace)
    const insertIdx = newLines.length
    for (const [varName, value] of unwritten) {
      newLines.splice(insertIdx, 0, `  ${varName}: ${value};`)
    }
  }

  const newBlock = opener + newLines.join('\n') + closer
  return cssContent.replace(fullMatch, newBlock)
}
