import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { siteConfig } from '@/lib/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  try {
    const payload = await getPayload({ config: payloadConfig })

    const { docs: posts } = await payload.find({
      collection: 'post',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true, updatedAt: true },
    })

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes]
  } catch {
    // DB may not be available during build
    return staticRoutes
  }
}
