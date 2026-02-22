import {
  admins,
  publishedOrAdmins,
  ownerOrAdmins,
} from '@/collections/shared/access'
import { slugField, seoFields } from '@/collections/shared/fields'
import { type CollectionConfig } from 'payload'

const Post: CollectionConfig<'post'> = {
  slug: 'post',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', '_status', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: publishedOrAdmins,
    create: admins,
    update: ownerOrAdmins('author'),
    delete: admins,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 30000,
      },
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Short summary shown in listings (max 300 chars)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tag',
      hasMany: true,
    },
    {
      name: 'categories',
      type: 'join',
      collection: 'post_category',
      on: 'post',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'user',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            if (operation === 'create' && !value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Auto-set when first published',
      },
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            if (!value && data?._status === 'published') {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
    seoFields(),
  ],
}

export default Post
