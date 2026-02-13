import { UserRole } from '@/collections/User/constants'

export const anyone = () => true

export const admins = ({
  req: { user },
}: {
  req: { user?: { role?: string } | null }
}) => {
  return user?.role === UserRole.Admin
}
