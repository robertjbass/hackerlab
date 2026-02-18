import { admins, selfOrAdmins, adminsOnly } from '@/collections/shared/access'
import { AuthjsStrategy } from '@/lib/auth/payload-strategy'
import {
  UserRole,
  userRoleOptions,
  authProviderOptions,
} from '@/collections/User/constants'
import { type CollectionConfig } from 'payload'

const User: CollectionConfig<'user'> = {
  slug: 'user',
  admin: {
    useAsTitle: 'email',
    defaultColumns: [
      'email',
      'name',
      'role',
      'authProvider',
      'lastAuthMethod',
      'updatedAt',
      'createdAt',
    ],
    group: 'Admin',
  },
  access: {
    read: selfOrAdmins,
    create: admins,
    update: selfOrAdmins,
    delete: admins,
    admin: admins,
  },
  auth: {
    useSessions: false,
    strategies: [AuthjsStrategy()],
  },
  hooks: {
    afterLogout: [
      async () => {
        try {
          const { cookies } = await import('next/headers')
          const cookieStore = await cookies()
          cookieStore.delete('authjs.session-token')
          cookieStore.delete('__Secure-authjs.session-token')
        } catch {
          // cookies() unavailable outside Next.js request context
        }
      },
    ],
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      access: {
        read: () => true,
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: UserRole.User,
      required: true,
      options: userRoleOptions,
      access: {
        read: () => true,
        create: admins,
        update: admins,
      },
    },
    {
      name: 'authProvider',
      label: 'Original Auth Provider',
      type: 'select',
      options: authProviderOptions,
      access: {
        read: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Original signup method',
      },
    },
    {
      name: 'lastAuthMethod',
      label: 'Most Recent Auth Method',
      type: 'select',
      options: authProviderOptions,
      access: {
        read: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Most recent login method',
      },
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'upload',
      relationTo: 'media',
      access: {
        read: () => true,
      },
      admin: {
        description: 'User-uploaded avatar image',
      },
    },
    {
      name: 'googleImageUrl',
      label: 'Google Image URL',
      type: 'text',
      access: {
        read: () => true,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'githubImageUrl',
      label: 'GitHub Image URL',
      type: 'text',
      access: {
        read: () => true,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'googleId',
      label: 'Google ID',
      type: 'text',
      unique: true,
      index: true,
      access: {
        read: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Google OAuth subject ID for account linking',
      },
    },
    {
      name: 'githubId',
      label: 'GitHub ID',
      type: 'text',
      unique: true,
      index: true,
      access: {
        read: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'GitHub OAuth user ID for account linking',
      },
    },
    {
      name: 'emailLoginToken',
      label: 'Email Login Token',
      type: 'text',
      index: true,
      access: {
        read: () => false,
        update: admins,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'emailLoginTokenExpires',
      label: 'Email Login Token Expires',
      type: 'date',
      access: {
        read: () => false,
        update: admins,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
}

export default User
