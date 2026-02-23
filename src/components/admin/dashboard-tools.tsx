'use client'

import type { CSSProperties } from 'react'

const cardStyle: CSSProperties = {
  padding: '1.5rem',
  backgroundColor: 'var(--theme-elevation-50)',
  borderRadius: '4px',
  border: '1px solid var(--theme-elevation-150)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}

const headingStyle: CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--theme-elevation-1000)',
}

const descriptionStyle: CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '0.875rem',
  color: 'var(--theme-elevation-600)',
  lineHeight: 1.4,
}

const linkButtonStyle: CSSProperties = {
  width: '50%',
  marginTop: 'auto',
  padding: '10px 20px',
  backgroundColor: 'var(--theme-elevation-150)',
  color: 'var(--theme-elevation-800)',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textDecoration: 'none',
}

export function DashboardTools() {
  return (
    <div>
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          margin: '2rem 0 1rem 0',
          color: 'var(--theme-elevation-1000)',
        }}
      >
        Tools
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={cardStyle}>
          <h3 style={headingStyle}>Theme Manager</h3>
          <p style={descriptionStyle}>
            Browse bundled themes, search Open VSX for new ones, preview colors,
            and apply directly to your app.
          </p>
          <a href="/admin/theme" style={linkButtonStyle}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3" cy="3" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="13" cy="3" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="3" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="13" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Open
          </a>
        </div>
      </div>
    </div>
  )
}
