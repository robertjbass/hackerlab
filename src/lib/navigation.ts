type NavLink = {
  label: string
  href: string
  external?: boolean
}

type FooterNavGroup = {
  title: string
  links: NavLink[]
}

export const mainNavLinks: NavLink[] = [
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
  {
    label: 'GitHub',
    href: 'https://github.com/robertjbass/hackerlab',
    external: true,
  },
]

export const footerNavGroups: FooterNavGroup[] = [
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Logo Concepts', href: '/logos' },
    ],
  },
  {
    title: 'Project',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/robertjbass/hackerlab',
        external: true,
      },
      { label: 'Sign In', href: '/auth/login' },
    ],
  },
]
