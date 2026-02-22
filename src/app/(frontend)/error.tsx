'use client'

import { Button } from '@/components/ui/button'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again.
          {error.digest && (
            <span className="mt-1 block text-xs">Error ID: {error.digest}</span>
          )}
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}
