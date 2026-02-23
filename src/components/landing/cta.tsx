import Link from 'next/link'
import { Github } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { siteConfig } from '@/lib/site-config'

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto mb-12 h-px w-24 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        <ScrollReveal className="scroll-reveal-scale">
          <div className="card-glow relative overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 via-card to-card/50 p-10 md:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-cta-blob" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl animate-cta-blob-alt" />
            <div className="relative max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Stop configuring, start building
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Fork the repo, set your env vars, and deploy to Vercel. Your
                next project is one clone away.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="shadow-xl shadow-primary/25"
                >
                  <Link
                    href={siteConfig.social.github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    Get Started on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
