import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from '@/components/icons'

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      {currentPage > 1 ? (
        <Button asChild variant="outline" className="h-11 sm:h-9">
          <Link href={`${basePath}?page=${currentPage - 1}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" className="h-11 sm:h-9" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Button asChild variant="outline" className="h-11 sm:h-9">
          <Link href={`${basePath}?page=${currentPage + 1}`}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" className="h-11 sm:h-9" disabled>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
