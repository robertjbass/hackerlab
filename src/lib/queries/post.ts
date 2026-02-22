import { cache } from 'react'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'

const POSTS_PER_PAGE = 12

async function getPayloadInstance() {
  return getPayload({ config: payloadConfig })
}

export const getPublishedPosts = cache(
  async ({ page = 1 }: { page?: number } = {}) => {
    const payload = await getPayloadInstance()
    return payload.find({
      collection: 'post',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: POSTS_PER_PAGE,
      page,
      depth: 1,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        author: true,
        publishedAt: true,
        tags: true,
      },
      populate: {
        media: {
          url: true,
          alt: true,
          sizes: true,
        },
        user: {
          name: true,
        },
        tag: {
          name: true,
          slug: true,
        },
      },
    })
  },
)

export const getPostBySlug = cache(async (slug: string) => {
  const payload = await getPayloadInstance()
  const { docs } = await payload.find({
    collection: 'post',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
})

export const getPostsByCategory = cache(
  async ({
    categorySlug,
    page = 1,
  }: {
    categorySlug: string
    page?: number
  }) => {
    const payload = await getPayloadInstance()

    // Find the category first
    const { docs: categories } = await payload.find({
      collection: 'category',
      where: { slug: { equals: categorySlug } },
      limit: 1,
    })
    if (categories.length === 0) return null

    const category = categories[0]

    // Find post_category junctions for this category
    const { docs: junctions } = await payload.find({
      collection: 'post_category',
      where: { category: { equals: category.id } },
      depth: 0,
      limit: 100,
    })

    const postIds = junctions.map((j) =>
      typeof j.post === 'number' ? j.post : j.post.id,
    )

    if (postIds.length === 0) {
      return {
        category,
        posts: {
          docs: [],
          totalPages: 0,
          page: 1,
          totalDocs: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    }

    const posts = await payload.find({
      collection: 'post',
      where: {
        and: [{ id: { in: postIds } }, { _status: { equals: 'published' } }],
      },
      sort: '-publishedAt',
      limit: POSTS_PER_PAGE,
      page,
      depth: 1,
    })

    return { category, posts }
  },
)

export const getPostsByTag = cache(
  async ({ tagSlug, page = 1 }: { tagSlug: string; page?: number }) => {
    const payload = await getPayloadInstance()

    const { docs: tags } = await payload.find({
      collection: 'tag',
      where: { slug: { equals: tagSlug } },
      limit: 1,
    })
    if (tags.length === 0) return null

    const tag = tags[0]

    const posts = await payload.find({
      collection: 'post',
      where: {
        and: [
          { tags: { contains: tag.id } },
          { _status: { equals: 'published' } },
        ],
      },
      sort: '-publishedAt',
      limit: POSTS_PER_PAGE,
      page,
      depth: 1,
    })

    return { tag, posts }
  },
)

export const getPublishedPostSlugs = cache(async () => {
  const payload = await getPayloadInstance()
  const { docs } = await payload.find({
    collection: 'post',
    where: { _status: { equals: 'published' } },
    // Cap at 1000 for static generation — additional posts use ISR
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter(Boolean) as string[]
})
