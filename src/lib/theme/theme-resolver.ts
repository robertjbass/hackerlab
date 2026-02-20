import type { VSCodeTheme } from './types'
import { BRIDGE_MAP } from './bridge-map'
import {
  adjustBrightness,
  getContrastColor,
  deriveChartColors,
  normalizeHex,
  isTransparent,
} from './color-utils'

// Hardcoded fallbacks matching the current indigo-slate globals.css values
const LIGHT_FALLBACKS: Record<string, string> = {
  '--background': '#ffffff',
  '--foreground': '#0f172a',
  '--card': '#ffffff',
  '--card-foreground': '#0f172a',
  '--popover': '#ffffff',
  '--popover-foreground': '#0f172a',
  '--primary': '#6366f1',
  '--primary-foreground': '#fafafa',
  '--secondary': '#f1f5f9',
  '--secondary-foreground': '#0f172a',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--accent': '#f1f5f9',
  '--accent-foreground': '#0f172a',
  '--destructive': '#ef4444',
  '--destructive-foreground': '#fafafa',
  '--border': '#e2e8f0',
  '--input': '#e2e8f0',
  '--ring': '#6366f1',
  '--chart-1': '#6366f1',
  '--chart-2': '#8b5cf6',
  '--chart-3': '#06b6d4',
  '--chart-4': '#f59e0b',
  '--chart-5': '#ef4444',
  '--sidebar': '#f8fafc',
  '--sidebar-foreground': '#0f172a',
  '--sidebar-primary': '#6366f1',
  '--sidebar-primary-foreground': '#fafafa',
  '--sidebar-accent': '#f1f5f9',
  '--sidebar-accent-foreground': '#0f172a',
  '--sidebar-border': '#e2e8f0',
  '--sidebar-ring': '#6366f1',
}

const DARK_FALLBACKS: Record<string, string> = {
  '--background': '#0f172a',
  '--foreground': '#fafafa',
  '--card': '#0f172a',
  '--card-foreground': '#fafafa',
  '--popover': '#0f172a',
  '--popover-foreground': '#fafafa',
  '--primary': '#6366f1',
  '--primary-foreground': '#fafafa',
  '--secondary': '#1e293b',
  '--secondary-foreground': '#fafafa',
  '--muted': '#1e293b',
  '--muted-foreground': '#64748b',
  '--accent': '#1e293b',
  '--accent-foreground': '#fafafa',
  '--destructive': '#ef4444',
  '--destructive-foreground': '#fafafa',
  '--border': '#334155',
  '--input': '#334155',
  '--ring': '#6366f1',
  '--chart-1': '#818cf8',
  '--chart-2': '#a78bfa',
  '--chart-3': '#06b6d4',
  '--chart-4': '#f59e0b',
  '--chart-5': '#ef4444',
  '--sidebar': '#1e293b',
  '--sidebar-foreground': '#fafafa',
  '--sidebar-primary': '#818cf8',
  '--sidebar-primary-foreground': '#fafafa',
  '--sidebar-accent': '#1e293b',
  '--sidebar-accent-foreground': '#fafafa',
  '--sidebar-border': '#334155',
  '--sidebar-ring': '#818cf8',
}

export function resolveTheme(
  theme: VSCodeTheme,
  mode: 'light' | 'dark',
): Record<string, string> {
  const fallbacks = mode === 'light' ? LIGHT_FALLBACKS : DARK_FALLBACKS
  const result: Record<string, string> = {}

  // Resolve primary first (needed for chart derivation and contrast)
  const primaryEntry = BRIDGE_MAP['--primary']
  let primaryHex = fallbacks['--primary']
  for (const token of primaryEntry.tokens) {
    const val = theme.colors[token]
    if (val && !isTransparent(val)) {
      primaryHex = normalizeHex(val)
      break
    }
  }

  // Pre-derive chart colors from primary
  const chartColors = deriveChartColors(primaryHex)

  for (const [cssVar, entry] of Object.entries(BRIDGE_MAP)) {
    // Chart colors
    if (entry.derive === 'chart') {
      const idx = parseInt(cssVar.replace('--chart-', '')) - 1
      result[cssVar] = chartColors[idx] ?? fallbacks[cssVar]
      continue
    }

    // Walk the fallback chain, skipping transparent values
    let resolved: string | undefined
    for (const token of entry.tokens) {
      const val = theme.colors[token]
      if (val && !isTransparent(val)) {
        resolved = normalizeHex(val)
        break
      }
    }

    // Derive contrast for primary-foreground when no token matched
    if (!resolved && entry.derive === 'contrast-of-primary') {
      resolved = getContrastColor(primaryHex)
    }

    // For border variables, derive from background if no token matched
    if (!resolved && cssVar.includes('border')) {
      const bg = result['--background'] ?? fallbacks['--background']
      const isDarkBg = getContrastColor(bg) === '#ffffff'
      resolved = adjustBrightness(bg, isDarkBg ? 20 : -15)
    }

    // For input border, derive similarly
    if (!resolved && cssVar === '--input') {
      const bg = result['--background'] ?? fallbacks['--background']
      const isDarkBg = getContrastColor(bg) === '#ffffff'
      resolved = adjustBrightness(bg, isDarkBg ? 25 : -20)
    }

    result[cssVar] = resolved ?? fallbacks[cssVar]
  }

  return result
}
