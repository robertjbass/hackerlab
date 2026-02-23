'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { LogoBeakerFlask, LogOut, Menu, X } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
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
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  // Close on resize to desktop
  useEffect(() => {
    if (!open) return

    const mq = window.matchMedia('(min-width: 1024px)')
    function handleChange(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [open])

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
                {...(link.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
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
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="sr-only">Toggle menu</span>
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      {/* Mobile menu — always rendered, animated via CSS */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-background/95 backdrop-blur-xl transition-all duration-200 lg:hidden',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <div className="mx-auto max-w-5xl space-y-1 px-6 py-3">
          {mainNavLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={cn(
                'block rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground',
                open && 'animate-mobile-nav-item',
              )}
              style={open ? { animationDelay: `${i * 40}ms` } : undefined}
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
          <div
            className={cn(
              'flex items-center gap-4 border-t border-white/10 pt-3',
              open && 'animate-mobile-nav-item',
            )}
            style={
              open
                ? { animationDelay: `${mainNavLinks.length * 40}ms` }
                : undefined
            }
          >
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
                    onClick={close}
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
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={close}
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="shadow-lg shadow-primary/20"
                  onClick={close}
                >
                  <Link href="/auth/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
