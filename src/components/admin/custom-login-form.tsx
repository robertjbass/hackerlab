'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, type CSSProperties } from 'react'
import { Google } from '@/components/icons/google'
import { GithubIcon } from '@/components/icons/github'
import {
  signInWithProvider,
  getAvailableProviders,
} from '@/app/(payload)/admin/login/actions'
import type { EnabledProvider } from '@/lib/auth/providers'

const PROVIDER_ICONS: Record<
  string,
  React.ComponentType<{ style?: CSSProperties }>
> = {
  google: Google,
  github: GithubIcon,
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'var(--theme-bg, #fff)',
  } satisfies CSSProperties,
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--theme-elevation-50, #fff)',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    padding: '2rem',
  } satisfies CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  } satisfies CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: '0.5rem',
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,
  description: {
    color: 'var(--theme-elevation-500, #6b7280)',
    margin: 0,
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '1rem',
    color: '#dc2626',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  button: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  } satisfies CSSProperties,
  outlineButton: {
    backgroundColor: 'var(--theme-elevation-50, #fff)',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,
  primaryButton: {
    backgroundColor: '#4f46e5',
    border: '1px solid #4f46e5',
    color: '#fff',
  } satisfies CSSProperties,
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } satisfies CSSProperties,
  oauthGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  } satisfies CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    gap: '0.75rem',
  } satisfies CSSProperties,
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--theme-elevation-150, #e5e7eb)',
  } satisfies CSSProperties,
  dividerText: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-500, #9ca3af)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  formGroup: {
    marginBottom: '1rem',
  } satisfies CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '0.375rem',
    color: 'var(--theme-text, #374151)',
  } satisfies CSSProperties,
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid var(--theme-elevation-150, #e5e7eb)',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'var(--theme-input-bg, #fff)',
    color: 'var(--theme-text, #1f2937)',
  } satisfies CSSProperties,
}

function getCallbackUrl(searchParams: URLSearchParams): string {
  const raw = searchParams.get('callbackUrl') ?? '/admin'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/admin'
  return raw
}

export function CustomLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getCallbackUrl(searchParams)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<EnabledProvider[]>([])

  const errorParam = searchParams.get('error')

  useEffect(() => {
    async function load() {
      const result = await getAvailableProviders()
      setProviders(result)
    }
    load()
  }, [])

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (res.ok) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        try {
          const data: unknown = await res.json()
          const message =
            (data as { errors?: { message?: string }[] }).errors?.[0]?.message
          setError(message || 'Invalid credentials')
        } catch {
          setError('Invalid credentials')
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred'
      if (process.env.NODE_ENV !== 'production') {
        console.error('[CustomLoginForm] login failed:', message)
      }
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayError = error || (errorParam ? 'Authentication failed. Please try again.' : '')
  const hasOAuth = providers.length > 0

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.description}>Sign in to access the admin panel</p>
        </div>

        {displayError && <div style={styles.error}>{displayError}</div>}

        {hasOAuth && (
          <div style={styles.oauthGroup}>
            {providers.map((provider) => {
              const Icon = PROVIDER_ICONS[provider.id]
              return (
                <form
                  key={provider.id}
                  action={signInWithProvider.bind(null, provider.id, callbackUrl)}
                >
                  <button
                    type="submit"
                    style={{ ...styles.button, ...styles.outlineButton }}
                  >
                    {Icon && <Icon style={{ width: 20, height: 20 }} />}
                    Continue with {provider.label}
                  </button>
                </form>
              )
            })}
          </div>
        )}

        {hasOAuth && (
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or sign in with email</span>
            <div style={styles.dividerLine} />
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
