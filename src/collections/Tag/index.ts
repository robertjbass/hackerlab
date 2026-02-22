import { anyone, admins } from '@/collections/shared/access'
import { slugField } from '@/collections/shared/fields'
import { type CollectionConfig } from 'payload'

const Tag: CollectionConfig<'tag'> = {
  slug: 'tag',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
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
    slugField('name'),
  ],
}

export default Tag
