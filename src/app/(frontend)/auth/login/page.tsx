'use client'

import { Github, Google } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signInWithProvider } from '@/app/(payload)/admin/login/actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Sign in to Hackerlab</CardTitle>
          <CardDescription>
            Access your developer tools and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form action={signInWithProvider.bind(null, 'google', '/')}>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Google className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
          </form>
          <form action={signInWithProvider.bind(null, 'github', '/')}>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
