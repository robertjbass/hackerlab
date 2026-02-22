import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { siteConfig } from '@/lib/site-config'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeCdata(text: string): string {
  return text.replace(/]]>/g, ']]]]><![CDATA[>')
}

export async function GET() {
  const payload = await getPayload({ config: payloadConfig })

  const { docs: posts } = await payload.find({
    collection: 'post',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50,
    depth: 0,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  })

  const items = posts
    .map((post) => {
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString()
      const link = `${siteConfig.url}/blog/${post.slug}`

      return `    <item>
      <title><![CDATA[${escapeCdata(post.title)}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.excerpt ? `<description><![CDATA[${escapeCdata(post.excerpt)}]]></description>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
