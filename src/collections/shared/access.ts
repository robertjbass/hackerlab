import { UserRole } from '@/collections/User/constants'
import type { Access, FieldAccess } from 'payload'

export const anyone = () => true

export const admins = ({
  req: { user },
}: {
  req: { user?: { role?: string } | null }
}) => {
  return user?.role === UserRole.Admin
}

export const selfOrAdmins: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === UserRole.Admin) return true
  return { id: { equals: user.id } }
}

export const adminsOnly: FieldAccess = ({ req: { user } }) => {
  return user?.role === UserRole.Admin
}
