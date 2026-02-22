import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Media, User, Tag } from '@/payload-types'

type PostCardPost = {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: (number | null) | Media
  tags?: (number | Tag)[] | null
  author?: (number | null) | User
  publishedAt?: string | null
}

type PostCardProps = {
  post: PostCardPost
}

export function PostCard({ post }: PostCardProps) {
  const featuredImage =
    typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? (post.featuredImage as Media)
      : null

  const authorName =
    typeof post.author === 'object' && post.author !== null
      ? (post.author as User).name
      : null

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const tags =
    post.tags && Array.isArray(post.tags)
      ? (post.tags.filter((t) => typeof t === 'object' && t !== null) as Tag[])
      : []

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`}>
        {featuredImage?.url && (
          <div className="relative aspect-video">
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <h2 className="line-clamp-2 text-lg font-semibold text-foreground">
            {post.title}
          </h2>
        </CardHeader>
        <CardContent>
          {post.excerpt && (
            <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {authorName && <span>{authorName}</span>}
            {authorName && publishedDate && <span>&middot;</span>}
            {publishedDate && <time>{publishedDate}</time>}
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
