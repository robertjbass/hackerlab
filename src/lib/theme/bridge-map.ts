// Maps shadcn/ui CSS variable names → VS Code token fallback chains.
// The resolver walks each chain in order; the first token found in the
// theme's `colors` object wins.

export type BridgeEntry = {
  tokens: string[]
  // When set, the resolver will use this literal value instead of a token
  // lookup. Useful for values derived at resolve time (chart colors, contrast).
  derive?: 'contrast-of-primary' | 'chart'
}

export const BRIDGE_MAP: Record<string, BridgeEntry> = {
  // Core
  '--background': { tokens: ['editor.background'] },
  '--foreground': { tokens: ['editor.foreground'] },
  '--card': { tokens: ['editorWidget.background', 'editor.background'] },
  '--card-foreground': {
    tokens: ['editorWidget.foreground', 'editor.foreground'],
  },
  '--popover': { tokens: ['editorWidget.background', 'editor.background'] },
  '--popover-foreground': {
    tokens: ['editorWidget.foreground', 'editor.foreground'],
  },
  '--primary': { tokens: ['button.background', 'focusBorder'] },
  '--primary-foreground': {
    tokens: ['button.foreground'],
    derive: 'contrast-of-primary',
  },
  '--secondary': {
    tokens: ['button.secondaryBackground', 'input.background'],
  },
  '--secondary-foreground': {
    tokens: ['button.secondaryForeground', 'editor.foreground'],
  },
  '--muted': {
    tokens: ['input.background', 'sideBarSectionHeader.background'],
  },
  '--muted-foreground': {
    tokens: ['input.placeholderForeground', 'activityBar.inactiveForeground'],
  },
  '--accent': { tokens: ['list.hoverBackground', 'input.background'] },
  '--accent-foreground': {
    tokens: ['list.hoverForeground', 'editor.foreground'],
  },
  '--destructive': { tokens: ['errorForeground', 'editorError.foreground'] },
  '--destructive-foreground': { tokens: ['button.foreground'] },
  '--border': { tokens: ['panel.border', 'sideBar.border', 'input.border'] },
  '--input': { tokens: ['input.border', 'panel.border'] },
  '--ring': { tokens: ['focusBorder', 'button.background'] },

  // Chart (derived from primary hue)
  '--chart-1': { tokens: [], derive: 'chart' },
  '--chart-2': { tokens: [], derive: 'chart' },
  '--chart-3': { tokens: [], derive: 'chart' },
  '--chart-4': { tokens: [], derive: 'chart' },
  '--chart-5': { tokens: [], derive: 'chart' },

  // Sidebar
  '--sidebar': { tokens: ['sideBar.background'] },
  '--sidebar-foreground': {
    tokens: ['sideBar.foreground', 'editor.foreground'],
  },
  '--sidebar-primary': { tokens: ['button.background', 'focusBorder'] },
  '--sidebar-primary-foreground': { tokens: ['button.foreground'] },
  '--sidebar-accent': {
    tokens: ['list.hoverBackground', 'list.inactiveSelectionBackground'],
  },
  '--sidebar-accent-foreground': {
    tokens: ['list.hoverForeground', 'sideBar.foreground'],
  },
  '--sidebar-border': { tokens: ['sideBar.border', 'panel.border'] },
  '--sidebar-ring': { tokens: ['focusBorder', 'button.background'] },
}

// Variables that the CSS writer should NOT touch
export const PRESERVED_VARIABLES = [
  '--radius',
  '--font-sans',
  '--font-mono',
  '--font-inter',
  '--font-jetbrains-mono',
]
