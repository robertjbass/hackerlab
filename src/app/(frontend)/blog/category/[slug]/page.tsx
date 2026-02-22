import { notFound } from 'next/navigation'
import { getPostsByCategory } from '@/lib/queries/post'
import { generatePageMetadata } from '@/lib/metadata'
import { PostCard } from '@/components/blog/post-card'
import { Pagination } from '@/components/blog/pagination'

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const result = await getPostsByCategory({ categorySlug: slug })
  if (!result) return {}

  return generatePageMetadata({
    title: result.category.name,
    description: result.category.description ?? undefined,
    path: `/blog/category/${slug}`,
  })
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)

  const result = await getPostsByCategory({ categorySlug: slug, page })
  if (!result) notFound()

  const { category, posts } = result

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-4 text-lg text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      {posts.docs.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No posts in this category yet.
        </p>
      ) : (
        <>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={posts.totalPages}
            basePath={`/blog/category/${slug}`}
          />
        </>
      )}
    </div>
  )
}
