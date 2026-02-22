import { notFound } from 'next/navigation'
import { getPostBySlug, getPublishedPostSlugs } from '@/lib/queries/post'
import { generatePageMetadata } from '@/lib/metadata'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Tag } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const revalidate = 60

type PostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    // Post table may not exist yet during first build
    return []
  }
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return generatePageMetadata({
    title: post.title,
    description: post.excerpt ?? undefined,
    seo: post.seo,
    path: `/blog/${post.slug}`,
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const authorName =
    typeof post.author === 'object' && post.author !== null
      ? post.author.name
      : null

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const tags =
    post.tags && Array.isArray(post.tags)
      ? post.tags.filter((t): t is Tag => typeof t === 'object' && t !== null)
      : []

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {authorName && <span>By {authorName}</span>}
          {publishedDate && (
            <time dateTime={post.publishedAt!}>{publishedDate}</time>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                <Badge variant="secondary">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}
      </header>

      {post.excerpt && (
        <p className="mb-8 text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <RichText data={post.content as SerializedEditorState} />
      </div>
    </article>
  )
}
