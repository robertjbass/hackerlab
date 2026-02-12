import { anyone, admins } from '@/collections/shared/access'
import { type CollectionConfig } from 'payload'

const Media: CollectionConfig<'media'> = {
  slug: 'media',
  admin: {
    group: 'Assets',
    defaultColumns: [
      'filename',
      'alt',
      'createdAt',
      'filesize',
      'width',
      'height',
    ],
  },
  upload: true,
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
      required: true,
    },
  ],
}

export default Media
