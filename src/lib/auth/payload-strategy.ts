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

        const userId = parseInt(session.user.id, 10)
        if (!Number.isInteger(userId) || userId <= 0) {
          console.error('[AuthjsStrategy] Invalid user ID:', session.user.id)
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

        // Enrich user with role names from the junction table
        const { docs: roleAssignments } = await payload.find({
          collection: 'user_role',
          where: { user: { equals: userId } },
          depth: 1,
          limit: 20,
        })
        const roleNames = roleAssignments
          .map((assignment) => {
            const role = assignment.role
            if (typeof role === 'object' && role !== null && 'name' in role) {
              return role.name
            }
            return null
          })
          .filter((r): r is string => r !== null)

        return {
          user: {
            ...user,
            _strategy: 'authjs',
            collection: 'user' as const,
            _roles: roleNames,
          },
        }
      } catch (error) {
        console.error('[AuthjsStrategy] Error authenticating user', error)
        return { user: null }
      }
    },
  }
}
