import { admins, selfOrAdmins, adminsOnly } from '@/collections/shared/access'
import { AuthjsStrategy } from '@/lib/auth/payload-strategy'
import { authProviderOptions, RoleName } from '@/collections/User/constants'
import { type CollectionConfig } from 'payload'

const User: CollectionConfig<'user'> = {
  slug: 'user',
  admin: {
    useAsTitle: 'email',
    defaultColumns: [
      'email',
      'name',
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
    admin: adminsOnly,
  },
  auth: {
    useSessions: false,
    strategies: [AuthjsStrategy()],
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const { totalDocs } = await req.payload.count({
          collection: 'user',
          req,
        })
        if (totalDocs > 1) return

        // First user — find or create the admin role, then assign it
        let { docs: roles } = await req.payload.find({
          collection: 'role',
          where: { name: { equals: RoleName.Admin } },
          limit: 1,
          req,
          overrideAccess: true,
        })
        if (roles.length === 0) {
          const newRole = await req.payload.create({
            collection: 'role',
            data: { name: RoleName.Admin },
            req,
            overrideAccess: true,
          })
          roles = [newRole]
        }

        await req.payload.create({
          collection: 'user_role',
          data: { user: doc.id, role: roles[0].id },
          req,
          overrideAccess: true,
        })
      },
    ],
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
      name: 'bio',
      type: 'textarea',
      access: {
        read: () => true,
      },
    },
    {
      name: 'roles',
      type: 'join',
      collection: 'user_role',
      on: 'user',
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
        update: adminsOnly,
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
        update: adminsOnly,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
}

export default User
