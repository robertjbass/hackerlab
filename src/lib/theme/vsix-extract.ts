import JSZip from 'jszip'
import type { VSCodeTheme } from './types'
import { normalizeHex, isTransparent } from './color-utils'

export type PreviewColors = {
  activityBar: string
  sidebar: string
  editor: string
  accent: string
  text: string
}

export type ExtractedTheme = {
  fileName: string
  label: string
  theme: VSCodeTheme
  previewColors: PreviewColors
}

export function stripJsonComments(text: string): string {
  return text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')
}

export function parseThemeJson(
  raw: string,
  sourceName: string,
): VSCodeTheme | null {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripJsonComments(raw))
  } catch {
    return null
  }

  if (!parsed.colors || typeof parsed.colors !== 'object') {
    return null
  }

  const name = (parsed.name as string) || sourceName
  const type =
    parsed.type === 'light' ? ('light' as const) : ('dark' as const)

  return {
    name,
    type,
    colors: parsed.colors as VSCodeTheme['colors'],
    tokenColors: parsed.tokenColors as VSCodeTheme['tokenColors'],
  }
}

export function extractPreviewColors(colors: VSCodeTheme['colors']): PreviewColors {
  function pick(...tokens: string[]): string {
    for (const t of tokens) {
      const v = colors[t]
      if (v && !isTransparent(v)) return normalizeHex(v)
    }
    return '#333333'
  }

  return {
    activityBar: pick('activityBar.background', 'sideBar.background'),
    sidebar: pick('sideBar.background', 'editor.background'),
    editor: pick('editor.background'),
    accent: pick('button.background', 'focusBorder'),
    text: pick('editor.foreground'),
  }
}

export async function extractThemesFromVsix(
  buffer: ArrayBuffer,
): Promise<ExtractedTheme[]> {
  const zip = await JSZip.loadAsync(buffer)

  const pkgFile = zip.file('extension/package.json')
  if (!pkgFile) {
    throw new Error('No package.json found in VSIX')
  }

  const pkgRaw = await pkgFile.async('string')
  const pkg = JSON.parse(pkgRaw) as {
    contributes?: {
      themes?: Array<{
        label?: string
        uiTheme?: string
        path?: string
      }>
    }
  }

  const contributions = pkg.contributes?.themes ?? []
  if (contributions.length === 0) {
    throw new Error('No theme contributions found in VSIX package.json')
  }

  const results: ExtractedTheme[] = []

  for (const contribution of contributions) {
    if (!contribution.path) continue

    const themePath = `extension/${contribution.path.replace(/^\.\//, '')}`
    const themeFile = zip.file(themePath)
    if (!themeFile) continue

    const themeRaw = await themeFile.async('string')
    const theme = parseThemeJson(themeRaw, contribution.label ?? themePath)
    if (!theme) continue

    if (contribution.label) {
      theme.name = contribution.label
    }

    if (
      contribution.uiTheme === 'vs' ||
      contribution.uiTheme === 'vs-light'
    ) {
      theme.type = 'light'
    } else if (
      contribution.uiTheme === 'vs-dark' ||
      contribution.uiTheme === 'hc-black'
    ) {
      theme.type = 'dark'
    }

    const fileName = themePath.split('/').pop()?.replace('.json', '') ?? 'theme'

    results.push({
      fileName,
      label: theme.name,
      theme,
      previewColors: extractPreviewColors(theme.colors),
    })
  }

  return results
}
