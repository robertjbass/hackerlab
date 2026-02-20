export type VSCodeColors = {
  'editor.background'?: string
  'editor.foreground'?: string
  'editor.lineHighlightBackground'?: string
  'editor.selectionBackground'?: string
  'editorCursor.foreground'?: string
  'editorWhitespace.foreground'?: string
  'editorIndentGuide.background'?: string
  'editorLineNumber.foreground'?: string
  'editorLineNumber.activeForeground'?: string
  'sideBar.background'?: string
  'sideBar.foreground'?: string
  'sideBar.border'?: string
  'sideBarTitle.foreground'?: string
  'sideBarSectionHeader.background'?: string
  'sideBarSectionHeader.foreground'?: string
  'activityBar.background'?: string
  'activityBar.foreground'?: string
  'activityBar.inactiveForeground'?: string
  'activityBar.border'?: string
  'activityBarBadge.background'?: string
  'activityBarBadge.foreground'?: string
  'titleBar.activeBackground'?: string
  'titleBar.activeForeground'?: string
  'titleBar.inactiveBackground'?: string
  'titleBar.inactiveForeground'?: string
  'titleBar.border'?: string
  'tab.activeBackground'?: string
  'tab.activeForeground'?: string
  'tab.inactiveBackground'?: string
  'tab.inactiveForeground'?: string
  'tab.border'?: string
  'editorGroupHeader.tabsBackground'?: string
  'list.activeSelectionBackground'?: string
  'list.activeSelectionForeground'?: string
  'list.inactiveSelectionBackground'?: string
  'list.inactiveSelectionForeground'?: string
  'list.hoverBackground'?: string
  'list.hoverForeground'?: string
  'list.focusBackground'?: string
  'list.focusForeground'?: string
  'input.background'?: string
  'input.foreground'?: string
  'input.border'?: string
  'input.placeholderForeground'?: string
  'inputOption.activeBackground'?: string
  'inputOption.activeBorder'?: string
  'inputOption.activeForeground'?: string
  'button.background'?: string
  'button.foreground'?: string
  'button.hoverBackground'?: string
  'button.secondaryBackground'?: string
  'button.secondaryForeground'?: string
  'button.secondaryHoverBackground'?: string
  'dropdown.background'?: string
  'dropdown.foreground'?: string
  'dropdown.border'?: string
  'scrollbar.shadow'?: string
  'scrollbarSlider.background'?: string
  'scrollbarSlider.hoverBackground'?: string
  'scrollbarSlider.activeBackground'?: string
  'badge.background'?: string
  'badge.foreground'?: string
  'progressBar.background'?: string
  'notifications.background'?: string
  'notifications.foreground'?: string
  'notifications.border'?: string
  'panel.background'?: string
  'panel.border'?: string
  'panelTitle.activeBorder'?: string
  'panelTitle.activeForeground'?: string
  'panelTitle.inactiveForeground'?: string
  'terminal.background'?: string
  'terminal.foreground'?: string
  'terminal.ansiBlack'?: string
  'terminal.ansiRed'?: string
  'terminal.ansiGreen'?: string
  'terminal.ansiYellow'?: string
  'terminal.ansiBlue'?: string
  'terminal.ansiMagenta'?: string
  'terminal.ansiCyan'?: string
  'terminal.ansiWhite'?: string
  'statusBar.background'?: string
  'statusBar.foreground'?: string
  'statusBar.border'?: string
  'statusBar.debuggingBackground'?: string
  'statusBar.noFolderBackground'?: string
  focusBorder?: string
  'widget.shadow'?: string
  'editorWidget.background'?: string
  'editorWidget.foreground'?: string
  'editorWidget.border'?: string
  'pickerGroup.background'?: string
  'pickerGroup.foreground'?: string
  'gitDecoration.addedResourceForeground'?: string
  'gitDecoration.modifiedResourceForeground'?: string
  'gitDecoration.deletedResourceForeground'?: string
  'gitDecoration.untrackedResourceForeground'?: string
  'gitDecoration.conflictingResourceForeground'?: string
  errorForeground?: string
  'editorError.foreground'?: string
  'editorWarning.foreground'?: string
  'editorInfo.foreground'?: string
  [key: string]: string | undefined
}

export type VSCodeTokenColor = {
  name?: string
  scope?: string | string[]
  settings: {
    foreground?: string
    background?: string
    fontStyle?: string
  }
}

export type VSCodeTheme = {
  name: string
  type: 'dark' | 'light'
  colors: VSCodeColors
  tokenColors?: VSCodeTokenColor[]
}

export type ActiveThemeConfig = {
  light?: { name: string; slug: string }
  dark?: { name: string; slug: string }
}
