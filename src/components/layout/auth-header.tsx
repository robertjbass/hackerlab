import { Header } from './header'
import { auth } from '@/lib/auth'

export async function AuthHeader() {
  let session
  try {
    session = await auth()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AuthHeader] auth() failed:', error)
    }
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
