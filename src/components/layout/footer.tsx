import Link from 'next/link'
import { Github, Terminal, X } from '@/components/icons'
import { siteConfig } from '@/lib/site-config'
import { footerNavGroups } from '@/lib/navigation'

export function Footer() {
  return (
    <footer className="relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-primary/3 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Terminal className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {siteConfig.name}
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Developer Tools
                </p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="-ml-2 mt-4 flex gap-0">
              <Link
                href={siteConfig.social.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.social.x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {footerNavGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pb-[env(safe-area-inset-bottom)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteConfig.copyright}
            </p>
            <p className="text-sm text-muted-foreground/50">
              Built with care for developers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
