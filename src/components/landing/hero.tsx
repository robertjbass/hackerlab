import Link from 'next/link'
import { ArrowRight, Github, Terminal } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site-config'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-900 to-slate-950 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full bg-primary/10 p-4">
              <Terminal className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {siteConfig.tagline.replace(/(\S+)$/, '')}
            <span className="text-primary">
              {siteConfig.tagline.split(' ').pop()}
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
            <Button asChild size="lg">
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
