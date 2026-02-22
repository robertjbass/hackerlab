import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site-config'

type SeoFields = {
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: { url?: string | null } | number | null
}

type GenerateMetadataOptions = {
  title: string
  description?: string
  seo?: SeoFields | null
  path?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  seo,
  path,
  noIndex,
}: GenerateMetadataOptions): Metadata {
  const metaTitle = seo?.metaTitle || title
  const metaDescription =
    seo?.metaDescription || description || siteConfig.description
  const url = path ? `${siteConfig.url}${path}` : siteConfig.url

  const ogImageUrl =
    seo?.ogImage && typeof seo.ogImage === 'object' && seo.ogImage.url
      ? seo.ogImage.url
      : undefined

  return {
    title: `${metaTitle} | ${siteConfig.name}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: siteConfig.name,
      type: 'website',
      ...(ogImageUrl
        ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
