import Link from 'next/link'
import { Github, Terminal, X } from '@/components/icons'
import { siteConfig } from '@/lib/site-config'
import { footerNavGroups } from '@/lib/navigation'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-4 flex gap-4">
              <Link
                href={siteConfig.social.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.social.x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {footerNavGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.copyright}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
