import type { AuthProvider } from '@/collections/User/constants'

export type EnabledProvider = {
  id: AuthProvider
  label: string
}

// Server-only: checks which OAuth providers have credentials configured
export function getEnabledProviders(): EnabledProvider[] {
  const providers: EnabledProvider[] = []

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push({ id: 'github' as AuthProvider, label: 'GitHub' })
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({ id: 'google' as AuthProvider, label: 'Google' })
  }

  return providers
}
