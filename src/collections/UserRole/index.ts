import { admins, authenticated } from '@/collections/shared/access'
import { type CollectionConfig } from 'payload'

const UserRoleCollection: CollectionConfig<'user_role'> = {
  slug: 'user_role',
  labels: { singular: 'User Role', plural: 'User Roles' },
  admin: {
    group: 'Admin',
    defaultColumns: ['user', 'role', 'createdAt'],
  },
  indexes: [{ fields: ['user', 'role'], unique: true }],
  access: {
    read: authenticated,
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data
        if (!data?.user || !data?.role) return data

        const { totalDocs } = await req.payload.count({
          collection: 'user_role',
          where: {
            and: [
              { user: { equals: data.user } },
              { role: { equals: data.role } },
            ],
          },
          req,
        })
        if (totalDocs > 0) {
          throw new Error('This role is already assigned to this user')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'user',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'role',
      required: true,
      index: true,
    },
  ],
}

export default UserRoleCollection
