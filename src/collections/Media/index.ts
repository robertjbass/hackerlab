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
  upload: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ],
    disableLocalStorage: true,
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'medium', width: 800, height: 600, position: 'centre' },
      { name: 'large', width: 1200, height: 900, position: 'centre' },
    ],
  },
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
