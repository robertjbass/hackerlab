type SocialLink = {
  url: string
  handle: string
}

type SiteConfig = {
  name: string
  description: string
  url: string
  copyright: string
  tagline: string
  social: {
    github: SocialLink
    x: SocialLink
    linkedin: SocialLink
  }
}

export const siteConfig: SiteConfig = {
  name: 'Hackerlab',
  description:
    'A batteries-included Next.js + Payload CMS starter. Clone it, deploy to Vercel, and start building.',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    process.env.AUTH_URL ||
    'http://localhost:3000',
  copyright: 'Layerbase, LLC | dba Hackerlab',
  tagline: 'Ship Your Next Project Faster',
  social: {
    github: {
      url: 'https://github.com/robertjbass/hackerlab',
      handle: 'robertjbass',
    },
    x: {
      url: 'https://x.com/bobdotjs',
      handle: 'bobdotjs',
    },
    linkedin: {
      url: 'https://linkedin.com/in/bbass9490',
      handle: 'bbass9490',
    },
  },
} as const
