import type { Media, User } from '@/payload-types'
import { AuthProvider } from '@/collections/User/constants'

type UserWithImage = Pick<
  User,
  'avatar' | 'googleImageUrl' | 'githubImageUrl' | 'lastAuthMethod'
>

const PROVIDER_IMAGE_FIELDS = {
  [AuthProvider.Google]: 'googleImageUrl',
  [AuthProvider.GitHub]: 'githubImageUrl',
} as const satisfies Partial<Record<AuthProvider, keyof UserWithImage>>

function getMediaUrl(avatar: UserWithImage['avatar']): string | null {
  if (typeof avatar === 'object' && avatar !== null) {
    return (avatar as Media).url ?? null
  }
  return null
}

export function resolveUserImage(user: UserWithImage): string | null {
  const avatarUrl = getMediaUrl(user.avatar)
  if (avatarUrl) return avatarUrl
  const lastMethod = user.lastAuthMethod as AuthProvider | null | undefined
  if (lastMethod && lastMethod in PROVIDER_IMAGE_FIELDS) {
    const field =
      PROVIDER_IMAGE_FIELDS[lastMethod as keyof typeof PROVIDER_IMAGE_FIELDS]
    const url = user[field]
    if (url) return url
  }
  if (user.googleImageUrl) return user.googleImageUrl
  if (user.githubImageUrl) return user.githubImageUrl
  return null
}
