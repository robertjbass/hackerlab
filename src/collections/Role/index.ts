import { anyone, admins } from '@/collections/shared/access'
import { type CollectionConfig } from 'payload'

const Role: CollectionConfig<'role'> = {
  slug: 'role',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'users',
      type: 'join',
      collection: 'user_role',
      on: 'role',
    },
  ],
}

export default Role
