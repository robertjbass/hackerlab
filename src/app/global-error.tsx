'use client'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{ maxWidth: '400px', textAlign: 'center', padding: '1rem' }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
              A critical error occurred. Please try again.
              {error.digest && (
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                  }}
                >
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: '1.5rem',
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
