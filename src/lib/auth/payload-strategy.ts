import { type AuthStrategy } from 'payload'

export function AuthjsStrategy(): AuthStrategy {
  return {
    name: 'authjs',
    authenticate: async ({ payload }) => {
      try {
        // Dynamic import required: payload.config.ts -> User/index.ts -> this file -> auth/index.ts -> @payload-config (circular)
        const { auth } = await import('@/lib/auth')
        const session = await auth()

        if (!session?.user?.id) return { user: null }

        const isUUID = session.user.id.includes('-')
        if (isUUID) {
          console.error('[AuthjsStrategy] UUID user IDs not supported')
          return { user: null }
        }

        const userId = parseInt(session.user.id, 10)
        if (isNaN(userId)) {
          console.error('[AuthjsStrategy] Invalid user ID value')
          return { user: null }
        }

        const user = await payload.findByID({
          collection: 'user',
          id: userId,
          depth: 0,
        })

        if (!user) {
          console.error('[AuthjsStrategy] User not found')
          return { user: null }
        }

        return {
          user: {
            ...user,
            _strategy: 'authjs',
            collection: 'user' as const,
          },
        }
      } catch (error) {
        console.error('[AuthjsStrategy] Error authenticating user', error)
        return { user: null }
      }
    },
  }
}
