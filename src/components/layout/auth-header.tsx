import { Header } from './header'
import { auth } from '@/lib/auth'

export async function AuthHeader() {
  let session
  try {
    session = await auth()
  } catch {
    // Stale or unreadable session cookie — treat as unauthenticated
  }

  const user = session?.user
    ? {
        email: session.user.email ?? null,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null

  return <Header user={user} />
}
