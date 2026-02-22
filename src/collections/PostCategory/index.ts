import { admins } from '@/collections/shared/access'
import { type CollectionConfig } from 'payload'

const PostCategory: CollectionConfig<'post_category'> = {
  slug: 'post_category',
  admin: {
    group: 'Content',
    defaultColumns: ['post', 'category', 'createdAt'],
  },
  indexes: [{ fields: ['post', 'category'], unique: true }],
  access: {
    read: () => true,
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data
        if (!data?.post || !data?.category) return data

        const { totalDocs } = await req.payload.count({
          collection: 'post_category',
          where: {
            and: [
              { post: { equals: data.post } },
              { category: { equals: data.category } },
            ],
          },
          req,
        })
        if (totalDocs > 0) {
          throw new Error('This category is already assigned to this post')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'post',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'category',
      required: true,
      index: true,
    },
  ],
}

export default PostCategory
