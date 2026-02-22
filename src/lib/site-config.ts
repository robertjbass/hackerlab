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
    'Premium software tools built by developers, for developers. Streamline your development process.',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    process.env.AUTH_URL ||
    'http://localhost:3000',
  copyright: 'Layerbase, LLC | dba Hackerlab',
  tagline: 'Developer Tools for Modern Workflows',
  social: {
    github: {
      url: 'https://github.com/robertjbass',
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
