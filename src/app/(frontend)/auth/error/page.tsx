import Link from 'next/link'

type ErrorPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { error } = await searchParams

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification:
      'The verification link may have expired or already been used.',
    OAuthAccountNotLinked:
      'This email is already associated with another account.',
    Default: 'An error occurred during authentication.',
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}
