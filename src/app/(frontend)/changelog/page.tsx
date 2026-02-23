import { generatePageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/lib/site-config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const revalidate = 3600

const CHANGELOG_URL =
  'https://raw.githubusercontent.com/robertjbass/hackerlab/main/CHANGELOG.md'

export function generateMetadata() {
  return generatePageMetadata({
    title: 'Changelog',
    description: `What's new in ${siteConfig.name}. Release notes, bug fixes, and feature updates.`,
    path: '/changelog',
  })
}

export default async function ChangelogPage() {
  let markdown: string | null = null

  try {
    const res = await fetch(CHANGELOG_URL, { next: { revalidate: 3600 } })
    if (res.ok) {
      markdown = await res.text()
    }
  } catch {
    // fetch failed — fall through to error state
  }

  if (!markdown) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Changelog
        </h1>
        <p className="mt-4 text-muted-foreground">
          Unable to load the changelog right now. You can view it directly on{' '}
          <a
            href={`${siteConfig.social.github.url}/blob/main/CHANGELOG.md`}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <div className="prose prose-slate max-w-none dark:prose-invert prose-pre:overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
