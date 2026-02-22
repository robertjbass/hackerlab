import { anyone, admins } from '@/collections/shared/access'
import { slugField } from '@/collections/shared/fields'
import { type CollectionConfig } from 'payload'

const Category: CollectionConfig<'category'> = {
  slug: 'category',
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
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'posts',
      type: 'join',
      collection: 'post_category',
      on: 'category',
    },
  ],
}

export default Category
