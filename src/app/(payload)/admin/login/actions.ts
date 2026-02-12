'use server'

import { signIn, signOut, auth } from '@/lib/auth'

export async function signInWithProvider(provider: string, callbackUrl: string) {
  const session = await auth()
  if (session) {
    await signOut({ redirect: false })
  }
  await signIn(provider, { redirectTo: callbackUrl })
}
