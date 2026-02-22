import Link from 'next/link'
import { ArrowRight } from '@/components/icons'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to supercharge your workflow?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Get started today and join thousands of developers using our tools.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/blog">Read the Blog</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
