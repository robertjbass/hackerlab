import type { ComponentType } from 'react'
import {
  FileText,
  GitBranch,
  Github,
  KeyRound,
  Paintbrush,
} from '@/components/icons'

type NavLink = {
  label: string
  href: string
  external?: boolean
  icon?: ComponentType<{ className?: string }>
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
      { label: 'Blog', href: '/blog', icon: FileText },
      { label: 'Changelog', href: '/changelog', icon: GitBranch },
      { label: 'Logo Concepts', href: '/logos', icon: Paintbrush },
    ],
  },
  {
    title: 'Project',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/robertjbass/hackerlab',
        external: true,
        icon: Github,
      },
      { label: 'Sign In', href: '/auth/login', icon: KeyRound },
    ],
  },
]
