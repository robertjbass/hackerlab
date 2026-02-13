'use server'

import { signIn, signOut, auth } from '@/lib/auth'

const ALLOWED_PROVIDERS = ['google', 'github'] as const

export async function signInWithProvider(provider: string, callbackUrl: string) {
  if (!ALLOWED_PROVIDERS.includes(provider as (typeof ALLOWED_PROVIDERS)[number])) {
    throw new Error(`Invalid auth provider: "${provider}"`)
  }
  const session = await auth()
  if (session) {
    await signOut({ redirect: false })
  }
  await signIn(provider, { redirectTo: callbackUrl })
}
