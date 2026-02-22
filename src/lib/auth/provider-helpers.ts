import { AuthProvider } from '@/collections/User/constants'

export enum ProviderIdField {
  Google = 'googleId',
  GitHub = 'githubId',
}

export enum ProviderImageField {
  Google = 'googleImageUrl',
  GitHub = 'githubImageUrl',
}

const providerIdMap: Record<string, ProviderIdField> = {
  [AuthProvider.Google]: ProviderIdField.Google,
  [AuthProvider.GitHub]: ProviderIdField.GitHub,
}

const providerImageMap: Record<string, ProviderImageField> = {
  [AuthProvider.Google]: ProviderImageField.Google,
  [AuthProvider.GitHub]: ProviderImageField.GitHub,
}

export function getProviderIdField(provider: string): ProviderIdField | null {
  return providerIdMap[provider] ?? null
}

export function getImageFieldForProvider(
  provider: string,
): ProviderImageField | null {
  return providerImageMap[provider] ?? null
}

const providerProfileImageField: Record<string, string> = {
  [AuthProvider.Google]: 'picture',
  [AuthProvider.GitHub]: 'avatar_url',
}

export function getProviderImageUrl(
  provider: string,
  profile: Record<string, unknown>,
): string | null {
  const field = providerProfileImageField[provider]
  return field ? ((profile[field] as string | undefined) ?? null) : null
}
