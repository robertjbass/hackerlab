import { type Option } from 'payload'

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

const userRoleLabels = {
  [UserRole.Admin]: 'Admin',
  [UserRole.User]: 'User',
} as const

export const userRoleOptions: Option[] = [
  { label: userRoleLabels[UserRole.Admin], value: UserRole.Admin },
  { label: userRoleLabels[UserRole.User], value: UserRole.User },
] as const satisfies Option[]

export enum AuthProvider {
  Google = 'google',
  GitHub = 'github',
  Email = 'email',
}

const authProviderLabels = {
  [AuthProvider.Google]: 'Google',
  [AuthProvider.GitHub]: 'GitHub',
  [AuthProvider.Email]: 'Email',
} as const

export const authProviderOptions: Option[] = [
  { label: authProviderLabels[AuthProvider.Google], value: AuthProvider.Google },
  { label: authProviderLabels[AuthProvider.GitHub], value: AuthProvider.GitHub },
  { label: authProviderLabels[AuthProvider.Email], value: AuthProvider.Email },
] as const satisfies Option[]
