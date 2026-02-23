import Link from 'next/link'
import { ArrowRight, Github, Terminal } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site-config'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-900 to-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 bg-dot-pattern" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-linear-to-br from-primary/15 via-primary/5 to-transparent blur-[120px] animate-blob-drift" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-8 animate-hero-entrance">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-indigo-300 shadow-lg shadow-primary/10">
              <Terminal className="h-4 w-4" />
              Developer Toolkit
            </div>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl animate-hero-entrance"
            style={{ animationDelay: '0.1s' }}
          >
            {siteConfig.tagline.replace(/(\S+)$/, '')}
            <br />
            <span className="text-gradient">
              {siteConfig.tagline.split(' ').pop()}
            </span>
          </h1>
          <p
            className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground animate-hero-entrance"
            style={{ animationDelay: '0.2s' }}
          >
            {siteConfig.description}
          </p>
          <div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-x-6 animate-hero-entrance"
            style={{ animationDelay: '0.3s' }}
          >
            <Button asChild size="lg" className="shadow-xl shadow-primary/25">
              <Link href="/auth/login">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white"
            >
              <Link
                href={siteConfig.social.github.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
