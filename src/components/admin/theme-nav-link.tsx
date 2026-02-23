import React from 'react'

export function ThemeNavLink() {
  return (
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
