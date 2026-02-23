import React from 'react'

export function ThemeNavLink() {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- Payload admin uses full-page nav, not client-side routing
    <a
      href="/admin/theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0 var(--gutter-h)',
        height: '2.25rem',
        fontSize: '0.8125rem',
        color: 'var(--theme-elevation-500)',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
    >
      Theme Manager
    </a>
  )
}
