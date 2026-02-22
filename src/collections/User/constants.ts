import { type Option } from 'payload'

export enum RoleName {
  Admin = 'admin',
  Editor = 'editor',
  User = 'user',
}

const roleNameLabels = {
  [RoleName.Admin]: 'Admin',
  [RoleName.Editor]: 'Editor',
  [RoleName.User]: 'User',
} as const

export const roleNameOptions = [
  { label: roleNameLabels[RoleName.Admin], value: RoleName.Admin },
  { label: roleNameLabels[RoleName.Editor], value: RoleName.Editor },
  { label: roleNameLabels[RoleName.User], value: RoleName.User },
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

export const authProviderOptions = [
  {
    label: authProviderLabels[AuthProvider.Google],
    value: AuthProvider.Google,
  },
  {
    label: authProviderLabels[AuthProvider.GitHub],
    value: AuthProvider.GitHub,
  },
  { label: authProviderLabels[AuthProvider.Email], value: AuthProvider.Email },
] as const satisfies Option[]
