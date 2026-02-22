'use client'

import { useEffect, useState } from 'react'
import { Github, Google } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  signInWithProvider,
  getAvailableProviders,
} from '@/app/(payload)/admin/login/actions'
import type { EnabledProvider } from '@/lib/auth/providers'

const POST_LOGIN_REDIRECT = '/'

const PROVIDER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  google: Google,
  github: Github,
}

export default function LoginPage() {
  const [providers, setProviders] = useState<EnabledProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await getAvailableProviders()
        setProviders(result)
      } catch {
        setError('Failed to load sign-in options. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sign in</CardTitle>
          <CardDescription>
            Access your developer tools and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
          {!loading &&
            !error &&
            providers.map((provider) => {
              const Icon = PROVIDER_ICONS[provider.id]
              return (
                <form
                  key={provider.id}
                  action={signInWithProvider.bind(
                    null,
                    provider.id,
                    POST_LOGIN_REDIRECT,
                  )}
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-11 w-full"
                    size="lg"
                  >
                    {Icon && <Icon className="mr-2 h-5 w-5" />}
                    Continue with {provider.label}
                  </Button>
                </form>
              )
            })}
          {!loading && !error && providers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No authentication providers configured
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
