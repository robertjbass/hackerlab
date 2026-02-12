'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogOut, Menu, Terminal, X } from '@/components/icons'
import { Button } from '@/components/ui/button'

type HeaderProps = {
  user?: {
    email?: string | null
    name?: string | null
    image?: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-x-12">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Hackerlab</span>
          </Link>
          <div className="hidden lg:flex lg:gap-x-8">
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <form action="/logout" method="GET">
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-6 pb-4">
            <Link
              href="/products"
              className="block py-2 text-base font-medium text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-base font-medium text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block py-2 text-base font-medium text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <div className="flex items-center gap-4 pt-4">
              {user ? (
                <>
                  <span className="text-base text-muted-foreground">
                    {user.name || user.email}
                  </span>
                  <form action="/logout" method="GET">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-base font-medium text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/auth/login">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
