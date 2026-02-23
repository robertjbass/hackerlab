'use client'

import { useState, useEffect, type CSSProperties } from 'react'

type PreviewColors = {
  activityBar: string
  sidebar: string
  editor: string
  accent: string
  text: string
}

type ThemeEntry = {
  slug: string
  name: string
  type: 'dark' | 'light'
  previewColors: PreviewColors
}

type ActiveConfig = {
  light?: { name: string; slug: string }
  dark?: { name: string; slug: string }
}

type OpenVSXResult = {
  name: string
  namespace: string
  displayName: string
  description: string
  version: string
  downloadCount: number
  averageRating: number | null
  files: { download: string; icon?: string }
}

type ExtractedTheme = {
  fileName: string
  label: string
  theme: {
    name: string
    type: 'dark' | 'light'
    colors: Record<string, string | undefined>
    tokenColors?: unknown[]
  }
  previewColors: PreviewColors
}

type Tab = 'bundled' | 'search'
type ApplyMode = 'light' | 'dark' | 'both'
type ApplyStatus = 'idle' | 'applying' | 'success' | 'error'

// ---------------------------------------------------------------------------
// Inline styles (no Tailwind in admin components)
// ---------------------------------------------------------------------------

const s = {
  container: {
    padding: '1.5rem',
    maxWidth: '960px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } satisfies CSSProperties,

  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,

  subtitle: {
    color: 'var(--theme-elevation-500, #6b7280)',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  } satisfies CSSProperties,

  activeInfo: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    marginBottom: '1rem',
    fontSize: '0.8125rem',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,

  warningBanner: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    marginBottom: '1rem',
    fontSize: '0.8125rem',
    color: '#92400e',
  } satisfies CSSProperties,

  tabBar: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid var(--theme-elevation-150, #e5e7eb)',
    marginBottom: '1.25rem',
  } satisfies CSSProperties,

  tab: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: 'var(--theme-elevation-500, #6b7280)',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'color 0.15s, border-color 0.15s',
  } satisfies CSSProperties,

  tabActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5',
  } satisfies CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
    gap: '0.875rem',
    marginBottom: '1.5rem',
  } satisfies CSSProperties,

  card: {
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
    border: '2px solid var(--theme-elevation-150, #e5e7eb)',
  } satisfies CSSProperties,

  cardSelected: {
    border: '2px solid #4f46e5',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  } satisfies CSSProperties,

  preview: {
    display: 'flex',
    height: '72px',
    width: '100%',
  } satisfies CSSProperties,

  previewActivity: {
    width: '10px',
    flexShrink: 0,
  } satisfies CSSProperties,

  previewSidebar: {
    width: '44px',
    flexShrink: 0,
  } satisfies CSSProperties,

  previewEditor: {
    flex: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } satisfies CSSProperties,

  previewLine: {
    height: '3px',
    borderRadius: '2px',
  } satisfies CSSProperties,

  cardFooter: {
    padding: '0.375rem 0.625rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontWeight: 500,
  } satisfies CSSProperties,

  typeBadge: {
    fontSize: '0.625rem',
    padding: '0.0625rem 0.375rem',
    borderRadius: '999px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  } satisfies CSSProperties,

  // Search tab
  searchRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  } satisfies CSSProperties,

  searchInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--theme-elevation-150, #d1d5db)',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: 'var(--theme-input-bg, #fff)',
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,

  btn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,

  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } satisfies CSSProperties,

  btnSecondary: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--theme-elevation-150, #d1d5db)',
    backgroundColor: 'transparent',
    color: 'var(--theme-text, #374151)',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,

  resultCard: {
    padding: '0.875rem',
    borderRadius: '8px',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    marginBottom: '0.75rem',
    backgroundColor: 'var(--theme-elevation-50, #fafafa)',
  } satisfies CSSProperties,

  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.375rem',
  } satisfies CSSProperties,

  resultName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,

  resultPublisher: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-500, #6b7280)',
  } satisfies CSSProperties,

  resultDescription: {
    fontSize: '0.8125rem',
    color: 'var(--theme-elevation-500, #6b7280)',
    marginBottom: '0.5rem',
    lineHeight: 1.4,
  } satisfies CSSProperties,

  resultMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-500, #9ca3af)',
  } satisfies CSSProperties,

  extractedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))',
    gap: '0.625rem',
    marginTop: '0.75rem',
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: 'var(--theme-elevation-50, #f1f5f9)',
    border: '1px solid var(--theme-elevation-150, #e2e8f0)',
  } satisfies CSSProperties,

  // Apply panel
  applyPanel: {
    padding: '1rem',
    borderRadius: '8px',
    border: '2px solid #4f46e5',
    backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
    marginBottom: '1.5rem',
  } satisfies CSSProperties,

  applyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  } satisfies CSSProperties,

  applyTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,

  modeSelector: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '0.8125rem',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,

  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.8125rem',
  } satisfies CSSProperties,

  applyActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  } satisfies CSSProperties,

  statusBanner: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    marginTop: '0.75rem',
  } satisfies CSSProperties,

  noThemes: {
    color: 'var(--theme-elevation-500, #6b7280)',
    textAlign: 'center',
    padding: '3rem 1rem',
    fontSize: '0.875rem',
  } satisfies CSSProperties,

  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    marginRight: '0.5rem',
    verticalAlign: 'middle',
  } satisfies CSSProperties,
}

// ---------------------------------------------------------------------------
// Mini VS Code preview component
// ---------------------------------------------------------------------------

function MiniPreview({
  colors,
  selected,
  onClick,
  label,
  type,
}: {
  colors: PreviewColors
  selected: boolean
  onClick: () => void
  label: string
  type: 'dark' | 'light'
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...s.card,
        ...(selected ? s.cardSelected : {}),
      }}
    >
      <div style={s.preview}>
        <div
          style={{ ...s.previewActivity, backgroundColor: colors.activityBar }}
        />
        <div
          style={{ ...s.previewSidebar, backgroundColor: colors.sidebar }}
        />
        <div
          style={{ ...s.previewEditor, backgroundColor: colors.editor }}
        >
          <div
            style={{
              ...s.previewLine,
              width: '75%',
              backgroundColor: colors.text,
              opacity: 0.3,
            }}
          />
          <div
            style={{
              ...s.previewLine,
              width: '50%',
              backgroundColor: colors.accent,
            }}
          />
          <div
            style={{
              ...s.previewLine,
              width: '65%',
              backgroundColor: colors.text,
              opacity: 0.3,
            }}
          />
          <div
            style={{
              ...s.previewLine,
              width: '85%',
              backgroundColor: colors.text,
              opacity: 0.3,
            }}
          />
        </div>
      </div>
      <div
        style={{
          ...s.cardFooter,
          backgroundColor: colors.sidebar,
          color: colors.text,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span
          style={{
            ...s.typeBadge,
            backgroundColor: type === 'dark' ? '#374151' : '#e5e7eb',
            color: type === 'dark' ? '#d1d5db' : '#374151',
          }}
        >
          {type}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ThemePreview() {
  const [themes, setThemes] = useState<ThemeEntry[]>([])
  const [active, setActive] = useState<ActiveConfig>({})
  const [isDev, setIsDev] = useState(true)
  const [tab, setTab] = useState<Tab>('bundled')

  // Selection state
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedExtracted, setSelectedExtracted] =
    useState<ExtractedTheme | null>(null)
  const [applyMode, setApplyMode] = useState<ApplyMode>('both')
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle')
  const [applyMessage, setApplyMessage] = useState('')

  // Preview CSS state
  const [previewing, setPreviewing] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OpenVSXResult[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Extract state
  const [extractingUrl, setExtractingUrl] = useState<string | null>(null)
  const [extractedThemes, setExtractedThemes] = useState<
    Record<string, ExtractedTheme[]>
  >({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/themes')
        if (res.ok) {
          const data = (await res.json()) as {
            themes: ThemeEntry[]
            active: ActiveConfig
            isDev: boolean
          }
          setThemes(data.themes)
          setActive(data.active)
          setIsDev(data.isDev)
        }
      } catch {
        // API not available
      }
    }
    load()
  }, [])

  // Inject keyframe for spinner (once)
  useEffect(() => {
    const id = 'theme-manager-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
    document.head.appendChild(style)
  }, [])

  function applyPreviewColors(colors: PreviewColors) {
    const root = document.documentElement
    root.style.setProperty('--theme-bg', colors.editor)
    root.style.setProperty('--theme-elevation-50', colors.sidebar)
    root.style.setProperty('--theme-text', colors.text)
    setPreviewing(true)
  }

  function resetPreview() {
    const root = document.documentElement
    root.style.removeProperty('--theme-bg')
    root.style.removeProperty('--theme-elevation-50')
    root.style.removeProperty('--theme-text')
    setPreviewing(false)
    setSelectedSlug(null)
    setSelectedExtracted(null)
    setApplyStatus('idle')
    setApplyMessage('')
  }

  function selectBundledTheme(slug: string) {
    const theme = themes.find((t) => t.slug === slug)
    if (!theme) return
    setSelectedSlug(slug)
    setSelectedExtracted(null)
    setApplyStatus('idle')
    setApplyMessage('')
    applyPreviewColors(theme.previewColors)
  }

  function selectExtractedTheme(extracted: ExtractedTheme) {
    setSelectedExtracted(extracted)
    setSelectedSlug(null)
    setApplyStatus('idle')
    setApplyMessage('')
    applyPreviewColors(extracted.previewColors)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchError('')
    try {
      const res = await fetch('/api/themes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error || `Search failed: ${res.status}`)
      }
      const data = (await res.json()) as {
        results: OpenVSXResult[]
        totalSize: number
      }
      setSearchResults(data.results)
      setSearchTotal(data.totalSize)
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Search failed',
      )
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleExtract(downloadUrl: string, key: string) {
    setExtractingUrl(key)
    try {
      const res = await fetch('/api/themes/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadUrl }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error || `Extract failed: ${res.status}`)
      }
      const data = (await res.json()) as { themes: ExtractedTheme[] }
      setExtractedThemes((prev) => ({ ...prev, [key]: data.themes }))
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Extraction failed',
      )
    } finally {
      setExtractingUrl(null)
    }
  }

  async function handleApply() {
    setApplyStatus('applying')
    setApplyMessage('')

    try {
      const body: Record<string, unknown> = { mode: applyMode }

      if (selectedSlug) {
        body.slug = selectedSlug
      } else if (selectedExtracted) {
        body.theme = selectedExtracted.theme
      }

      const res = await fetch('/api/themes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as {
        success?: boolean
        error?: string
        applied?: { modes: string[]; themeName: string; slug: string }
      }

      if (!res.ok) {
        throw new Error(data.error || `Apply failed: ${res.status}`)
      }

      setApplyStatus('success')
      setApplyMessage(
        `Applied "${data.applied?.themeName}" to ${data.applied?.modes?.join(' & ')}. Changes appear after hot reload.`,
      )

      // Refresh theme list and active config
      const refreshRes = await fetch('/api/themes')
      if (refreshRes.ok) {
        const refreshData = (await refreshRes.json()) as {
          themes: ThemeEntry[]
          active: ActiveConfig
          isDev: boolean
        }
        setThemes(refreshData.themes)
        setActive(refreshData.active)
      }
    } catch (error) {
      setApplyStatus('error')
      setApplyMessage(
        error instanceof Error ? error.message : 'Apply failed',
      )
    }
  }

  const activeNames = [
    active.light ? `Light: ${active.light.name}` : null,
    active.dark ? `Dark: ${active.dark.name}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const hasSelection = selectedSlug !== null || selectedExtracted !== null
  const selectedName = selectedSlug
    ? themes.find((t) => t.slug === selectedSlug)?.name
    : selectedExtracted?.label

  const selectedType = selectedSlug
    ? themes.find((t) => t.slug === selectedSlug)?.type
    : selectedExtracted?.theme.type

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Theme Manager</h2>
      <p style={s.subtitle}>
        Browse, preview, and apply VS Code themes to your app.
      </p>

      {activeNames && (
        <div style={s.activeInfo}>
          <strong>Active:</strong> {activeNames}
        </div>
      )}

      {!isDev && (
        <div style={s.warningBanner}>
          Theme application is disabled in production. Run the dev server to
          apply themes.
        </div>
      )}

      {/* Apply panel */}
      {hasSelection && (
        <div style={s.applyPanel}>
          <div style={s.applyHeader}>
            <span style={s.applyTitle}>
              Selected: {selectedName}{' '}
              <span style={{ fontWeight: 400, opacity: 0.6 }}>
                ({selectedType})
              </span>
            </span>
            <button
              type="button"
              onClick={resetPreview}
              style={s.btnSecondary}
            >
              Reset Preview
            </button>
          </div>

          <div style={s.modeSelector}>
            <span style={{ fontWeight: 600 }}>Apply to:</span>
            {(['light', 'dark', 'both'] as const).map((mode) => (
              <label key={mode} style={s.radioLabel}>
                <input
                  type="radio"
                  name="applyMode"
                  value={mode}
                  checked={applyMode === mode}
                  onChange={() => setApplyMode(mode)}
                />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </label>
            ))}
          </div>

          <div style={s.applyActions}>
            <button
              type="button"
              onClick={handleApply}
              disabled={!isDev || applyStatus === 'applying'}
              style={{
                ...s.btn,
                ...(!isDev || applyStatus === 'applying'
                  ? s.btnDisabled
                  : {}),
              }}
            >
              {applyStatus === 'applying' && <span style={s.spinner} />}
              {applyStatus === 'applying' ? 'Applying...' : 'Apply Theme'}
            </button>
          </div>

          {applyMessage && (
            <div
              style={{
                ...s.statusBanner,
                backgroundColor:
                  applyStatus === 'success' ? '#ecfdf5' : '#fef2f2',
                color: applyStatus === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${applyStatus === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {applyMessage}
            </div>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div style={s.tabBar}>
        <button
          type="button"
          onClick={() => setTab('bundled')}
          style={{
            ...s.tab,
            ...(tab === 'bundled' ? s.tabActive : {}),
          }}
        >
          Bundled Themes
        </button>
        <button
          type="button"
          onClick={() => setTab('search')}
          style={{
            ...s.tab,
            ...(tab === 'search' ? s.tabActive : {}),
          }}
        >
          Search Open VSX
        </button>
      </div>

      {/* Bundled themes tab */}
      {tab === 'bundled' && (
        <>
          {themes.length === 0 ? (
            <div style={s.noThemes}>
              No themes found. Add themes to <code>src/themes/</code> or use
              the Search tab to find one.
            </div>
          ) : (
            <div style={s.grid}>
              {themes.map((theme) => (
                <MiniPreview
                  key={theme.slug}
                  colors={theme.previewColors}
                  selected={selectedSlug === theme.slug}
                  onClick={() => selectBundledTheme(theme.slug)}
                  label={theme.name}
                  type={theme.type}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Search tab */}
      {tab === 'search' && (
        <>
          <div style={s.searchRow}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="Search themes (e.g. Dracula, One Dark, Nord...)"
              style={s.searchInput}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              style={{
                ...s.btn,
                ...(searchLoading || !searchQuery.trim()
                  ? s.btnDisabled
                  : {}),
              }}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchError && (
            <div
              style={{
                ...s.statusBanner,
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                marginBottom: '1rem',
              }}
            >
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--theme-elevation-500, #9ca3af)',
                marginBottom: '0.75rem',
              }}
            >
              Showing {searchResults.length} of {searchTotal} results
            </div>
          )}

          {searchResults.map((result) => {
            const key = `${result.namespace}/${result.name}`
            const isExtracting = extractingUrl === key
            const extracted = extractedThemes[key]

            return (
              <div key={key} style={s.resultCard}>
                <div style={s.resultHeader}>
                  <div>
                    <div style={s.resultName}>{result.displayName}</div>
                    <div style={s.resultPublisher}>{result.namespace}</div>
                  </div>
                  {result.files.download && (
                    <button
                      type="button"
                      onClick={() =>
                        handleExtract(result.files.download, key)
                      }
                      disabled={isExtracting}
                      style={{
                        ...s.btnSecondary,
                        ...(isExtracting ? s.btnDisabled : {}),
                        flexShrink: 0,
                      }}
                    >
                      {isExtracting && <span style={s.spinner} />}
                      {isExtracting
                        ? 'Extracting...'
                        : extracted
                          ? 'Re-extract'
                          : 'View Themes'}
                    </button>
                  )}
                </div>

                {result.description && (
                  <div style={s.resultDescription}>
                    {result.description.length > 120
                      ? result.description.slice(0, 120) + '...'
                      : result.description}
                  </div>
                )}

                <div style={s.resultMeta}>
                  <span>v{result.version}</span>
                  <span>
                    {result.downloadCount.toLocaleString()} downloads
                  </span>
                  {result.averageRating !== null && (
                    <span aria-label={`${result.averageRating.toFixed(1)} out of 5 stars`}>
                      {result.averageRating.toFixed(1)}/5
                    </span>
                  )}
                </div>

                {/* Extracted theme variants */}
                {extracted && extracted.length > 0 && (
                  <div style={s.extractedGrid}>
                    {extracted.map((et, i) => (
                      <MiniPreview
                        key={`${key}-${i}`}
                        colors={et.previewColors}
                        selected={selectedExtracted === et}
                        onClick={() => selectExtractedTheme(et)}
                        label={et.label}
                        type={et.theme.type}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
