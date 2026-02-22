import { RoleName } from '@/collections/User/constants'
import type { Access, FieldAccess, Payload } from 'payload'

export async function getUserRoles(
  user: Record<string, unknown>,
  payload: Payload,
): Promise<string[]> {
  if (Array.isArray(user._roles)) return user._roles as string[]
  if (!user.id) return []

  const { docs } = await payload.find({
    collection: 'user_role',
    where: { user: { equals: user.id } },
    depth: 1,
    limit: 20,
  })

  const roles = docs
    .map((doc) => {
      const role = doc.role
      if (typeof role === 'object' && role !== null && 'name' in role) {
        return role.name
      }
      return null
    })
    .filter((r): r is string => r !== null)

  // Cache on user object for subsequent checks in the same request
  user._roles = roles
  return roles
}

function asRecord(user: unknown): Record<string, unknown> {
  return user as Record<string, unknown>
}

export const anyone = () => true

export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const admins: Access = async ({ req: { user, payload } }) => {
  if (!user) return false
  const roles = await getUserRoles(asRecord(user), payload)
  return roles.includes(RoleName.Admin)
}

export const selfOrAdmins: Access = async ({ req: { user, payload } }) => {
  if (!user) return false
  const roles = await getUserRoles(asRecord(user), payload)
  if (roles.includes(RoleName.Admin)) return true
  return { id: { equals: user.id } }
}

export const adminsOnly: FieldAccess = async ({ req: { user, payload } }) => {
  if (!user) return false
  const roles = await getUserRoles(asRecord(user), payload)
  return roles.includes(RoleName.Admin)
}

export const publishedOrAdmins: Access = async ({ req: { user, payload } }) => {
  if (!user) return { _status: { equals: 'published' } }
  const roles = await getUserRoles(asRecord(user), payload)
  if (roles.includes(RoleName.Admin)) return true
  return { _status: { equals: 'published' } }
}

export function ownerOrAdmins(ownerField: string): Access {
  return async ({ req: { user, payload } }) => {
    if (!user) return false
    const roles = await getUserRoles(asRecord(user), payload)
    if (roles.includes(RoleName.Admin)) return true
    return { [ownerField]: { equals: user.id } }
  }
}
