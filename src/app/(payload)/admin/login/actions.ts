'use server'

import { signIn, signOut, auth } from '@/lib/auth'
import { getEnabledProviders, type EnabledProvider } from '@/lib/auth/providers'

export async function getAvailableProviders(): Promise<EnabledProvider[]> {
  return getEnabledProviders()
}

export async function signInWithProvider(
  provider: string,
  callbackUrl: string,
) {
  const enabled = getEnabledProviders()
  if (!enabled.some((p) => p.id === provider)) {
    throw new Error(`Auth provider "${provider}" is not configured`)
  }
  const session = await auth()
  if (session) {
    await signOut({ redirect: false })
  }
  await signIn(provider, { redirectTo: callbackUrl })
}
