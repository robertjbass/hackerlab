'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogoBeakerFlask, LogOut, Menu, X } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site-config'
import { mainNavLinks } from '@/lib/navigation'

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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-x-12">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoBeakerFlask className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
          </Link>
          <div className="hidden lg:flex lg:gap-x-8">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <form action="/logout" method="POST">
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
              <Button asChild size="sm" className="shadow-lg shadow-primary/20">
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
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

      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto px-6 pb-4">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-base font-medium text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4">
              {user ? (
                <>
                  <span className="text-base text-muted-foreground">
                    {user.name || user.email}
                  </span>
                  <form action="/logout" method="POST">
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
                    className="shadow-lg shadow-primary/20"
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
