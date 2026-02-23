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
    title: 'Account',
    links: [{ label: 'Sign In', href: '/auth/login' }],
  },
]
