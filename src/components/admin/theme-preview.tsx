'use client'

import { useState, useEffect, type CSSProperties } from 'react'

type ThemeEntry = {
  slug: string
  name: string
  type: 'dark' | 'light'
  previewColors: {
    sidebar: string
    editor: string
    accent: string
    text: string
    activityBar: string
  }
}

type ActiveConfig = {
  light?: { name: string; slug: string }
  dark?: { name: string; slug: string }
}

const s = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  } satisfies CSSProperties,
  heading: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,
  subtitle: {
    color: 'var(--theme-elevation-500, #6b7280)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  activeInfo: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  } satisfies CSSProperties,
  card: {
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
    border: '2px solid transparent',
  } satisfies CSSProperties,
  cardSelected: {
    border: '2px solid var(--theme-elevation-500, #3b82f6)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  } satisfies CSSProperties,
  preview: {
    display: 'flex',
    height: '80px',
    width: '100%',
  } satisfies CSSProperties,
  previewActivity: {
    width: '10px',
    flexShrink: 0,
  } satisfies CSSProperties,
  previewSidebar: {
    width: '50px',
    flexShrink: 0,
  } satisfies CSSProperties,
  previewEditor: {
    flex: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  } satisfies CSSProperties,
  previewLine: {
    height: '4px',
    borderRadius: '2px',
  } satisfies CSSProperties,
  cardFooter: {
    padding: '0.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    fontWeight: 500,
  } satisfies CSSProperties,
  typeBadge: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '999px',
    opacity: 0.7,
  } satisfies CSSProperties,
  cliSection: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    marginTop: '1.5rem',
  } satisfies CSSProperties,
  cliHeading: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    overflowX: 'auto',
    whiteSpace: 'pre',
    lineHeight: 1.6,
  } satisfies CSSProperties,
  previewBanner: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#92400e',
  } satisfies CSSProperties,
  previewButton: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
  } satisfies CSSProperties,
  resetButton: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid #fde68a',
    backgroundColor: 'transparent',
    color: '#92400e',
    marginLeft: '0.5rem',
  } satisfies CSSProperties,
  noThemes: {
    color: 'var(--theme-elevation-500, #6b7280)',
    textAlign: 'center',
    padding: '3rem 1rem',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
}

export function ThemePreview() {
  const [themes, setThemes] = useState<ThemeEntry[]>([])
  const [active, setActive] = useState<ActiveConfig>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [originalVars, setOriginalVars] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/themes')
        if (res.ok) {
          const data = (await res.json()) as {
            themes: ThemeEntry[]
            active: ActiveConfig
          }
          setThemes(data.themes)
          setActive(data.active)
        }
      } catch {
        // API not available
      }
    }
    load()
  }, [])

  function handlePreview(slug: string) {
    const theme = themes.find((t) => t.slug === slug)
    if (!theme) return

    setSelected(slug)

    // Save current CSS vars before overriding
    if (!previewing) {
      const root = document.documentElement
      const computed = getComputedStyle(root)
      const vars: Record<string, string> = {}
      const varNames = [
        '--background',
        '--foreground',
        '--primary',
        '--primary-foreground',
        '--card',
        '--card-foreground',
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--border',
        '--sidebar',
        '--sidebar-foreground',
      ]
      for (const name of varNames) {
        vars[name] = computed.getPropertyValue(name).trim()
      }
      setOriginalVars(vars)
    }

    // Apply preview colors to the admin panel
    const root = document.documentElement
    const c = theme.previewColors
    root.style.setProperty('--theme-bg', c.editor)
    root.style.setProperty('--theme-elevation-50', c.sidebar)
    root.style.setProperty('--theme-text', c.text)

    setPreviewing(true)
  }

  function handleResetPreview() {
    const root = document.documentElement
    root.style.removeProperty('--theme-bg')
    root.style.removeProperty('--theme-elevation-50')
    root.style.removeProperty('--theme-text')

    // Restore original vars
    for (const [name, value] of Object.entries(originalVars)) {
      root.style.setProperty(name, value)
    }

    setPreviewing(false)
    setSelected(null)
  }

  const activeNames = [
    active.light ? `Light: ${active.light.name}` : null,
    active.dark ? `Dark: ${active.dark.name}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Theme Manager</h2>
      <p style={s.subtitle}>
        Preview bundled themes and apply them via the CLI.
      </p>

      {activeNames && (
        <div style={s.activeInfo}>
          <strong>Active:</strong> {activeNames}
        </div>
      )}

      {previewing && (
        <div style={s.previewBanner}>
          <span>
            Previewing:{' '}
            <strong>{themes.find((t) => t.slug === selected)?.name}</strong>
          </span>
          <button
            type="button"
            onClick={handleResetPreview}
            style={s.resetButton}
          >
            Reset Preview
          </button>
        </div>
      )}

      {themes.length === 0 ? (
        <div style={s.noThemes}>
          No themes found. Add themes to <code>src/themes/</code> or import one
          with <code>pnpm import-theme</code>.
        </div>
      ) : (
        <div style={s.grid}>
          {themes.map((theme) => {
            const isSelected = selected === theme.slug
            const c = theme.previewColors
            return (
              <div
                key={theme.slug}
                onClick={() => handlePreview(theme.slug)}
                style={{
                  ...s.card,
                  ...(isSelected ? s.cardSelected : {}),
                }}
              >
                <div style={s.preview}>
                  <div
                    style={{
                      ...s.previewActivity,
                      backgroundColor: c.activityBar,
                    }}
                  />
                  <div
                    style={{
                      ...s.previewSidebar,
                      backgroundColor: c.sidebar,
                    }}
                  />
                  <div
                    style={{
                      ...s.previewEditor,
                      backgroundColor: c.editor,
                    }}
                  >
                    <div
                      style={{
                        ...s.previewLine,
                        width: '75%',
                        backgroundColor: c.text,
                        opacity: 0.3,
                      }}
                    />
                    <div
                      style={{
                        ...s.previewLine,
                        width: '50%',
                        backgroundColor: c.accent,
                      }}
                    />
                    <div
                      style={{
                        ...s.previewLine,
                        width: '65%',
                        backgroundColor: c.text,
                        opacity: 0.3,
                      }}
                    />
                    <div
                      style={{
                        ...s.previewLine,
                        width: '85%',
                        backgroundColor: c.text,
                        opacity: 0.3,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    ...s.cardFooter,
                    backgroundColor: c.sidebar,
                    color: c.text,
                  }}
                >
                  <span>{theme.name}</span>
                  <span
                    style={{
                      ...s.typeBadge,
                      backgroundColor:
                        theme.type === 'dark' ? '#374151' : '#e5e7eb',
                      color: theme.type === 'dark' ? '#d1d5db' : '#374151',
                    }}
                  >
                    {theme.type}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={s.cliSection}>
        <div style={s.cliHeading}>Apply a Theme</div>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-500, #6b7280)',
            marginBottom: '0.75rem',
          }}
        >
          Themes are applied at build time via the CLI. Use these commands to
          apply the selected theme:
        </p>
        <div style={s.codeBlock}>
          {selected
            ? [
                `# Apply ${themes.find((t) => t.slug === selected)?.name} to both light and dark modes`,
                `pnpm import-theme --file src/themes/${selected}.json --both`,
                '',
                '# Or apply to a specific mode',
                `pnpm import-theme --file src/themes/${selected}.json --mode dark`,
                `pnpm import-theme --file src/themes/${selected}.json --mode light`,
              ].join('\n')
            : [
                '# Apply a bundled theme',
                'pnpm import-theme --file src/themes/<name>.json --both',
                '',
                '# Import from VS Code marketplace',
                'pnpm import-theme --vscode "Theme Name"',
                '',
                '# Import from URL',
                'pnpm import-theme --url <raw-json-url> --both',
                '',
                '# List available themes',
                'pnpm import-theme --list',
              ].join('\n')}
        </div>
      </div>
    </div>
  )
}
