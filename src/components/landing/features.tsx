import {
  Boxes,
  Code,
  GitBranch,
  Shield,
  Terminal,
  Zap,
} from '@/components/icons'
import { ScrollReveal } from '@/components/scroll-reveal'

const features = [
  {
    name: 'Lightning Fast',
    description:
      'Optimized for performance. No bloat, just the tools you need.',
    icon: Zap,
  },
  {
    name: 'Secure by Default',
    description: 'Built with security in mind. Your data stays private.',
    icon: Shield,
  },
  {
    name: 'Developer First',
    description: 'Created by developers who understand your workflow.',
    icon: Code,
  },
  {
    name: 'Version Control',
    description: 'Seamless integration with Git and your favorite tools.',
    icon: GitBranch,
  },
  {
    name: 'CLI Support',
    description: 'Powerful command-line interfaces for automation.',
    icon: Terminal,
  },
  {
    name: 'Modular Design',
    description: 'Pick and choose the tools that fit your needs.',
    icon: Boxes,
  },
]

export function Features() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-50" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto mb-4 h-px w-24 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        <ScrollReveal className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for developers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tools that integrate seamlessly into your development workflow
          </p>
        </ScrollReveal>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.name} delay={index * 80}>
                <div className="group card-glow card-hover-lift relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card">
                  <span className="absolute right-4 top-4 font-mono text-xs text-primary/20">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {feature.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
