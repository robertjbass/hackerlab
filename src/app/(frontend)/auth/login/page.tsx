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

  useEffect(() => {
    async function load() {
      const result = await getAvailableProviders()
      setProviders(result)
    }
    load()
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sign in</CardTitle>
          <CardDescription>
            Access your developer tools and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {providers.map((provider) => {
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
                  className="w-full"
                  size="lg"
                >
                  {Icon && <Icon className="mr-2 h-5 w-5" />}
                  Continue with {provider.label}
                </Button>
              </form>
            )
          })}
          {providers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No authentication providers configured
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
