import {
  ArrowUpCircle,
  Blocks,
  Database,
  FileText,
  GitBranch,
  KeyRound,
  Paintbrush,
  Smartphone,
  Terminal,
} from '@/components/icons'
import { ScrollReveal } from '@/components/scroll-reveal'

const features = [
  {
    name: 'Payload CMS',
    description:
      'Full admin panel, collections, and content management out of the box with auto-generated TypeScript types.',
    icon: Blocks,
  },
  {
    name: 'Auth Ready',
    description:
      'GitHub and Google OAuth, magic link email sign-in, and a clean RBAC user system ready to go.',
    icon: KeyRound,
  },
  {
    name: 'Postgres + Vercel',
    description:
      'Deploy to Vercel with Neon Postgres, Vercel Blob storage, and branch-aware database support.',
    icon: Database,
  },
  {
    name: 'VS Code Themes',
    description:
      'Built-in theme engine compatible with the VS Code ecosystem. Browse, preview, and apply thousands of themes.',
    icon: Paintbrush,
  },
  {
    name: 'Mobile Friendly',
    description:
      'Responsive design with TailwindCSS v4, shadcn/ui components, and a mobile-first layout.',
    icon: Smartphone,
  },
  {
    name: 'Easy Upgrades',
    description:
      'Payload, Next.js, React, and ESLint are all independently upgradable. No lock-in to outdated versions.',
    icon: ArrowUpCircle,
  },
  {
    name: 'Changelog Management',
    description:
      'Built-in changelog with version bumping scripts. Publish release notes that render automatically on the site.',
    icon: FileText,
  },
  {
    name: 'Migration Management',
    description:
      'Payload-managed database migrations with dev push mode for rapid iteration and production-safe rollouts.',
    icon: GitBranch,
  },
  {
    name: 'Dev Tooling',
    description:
      'Opinionated lint and type-check rules, built-in scripts, LLM-ready CLAUDE.md, and email support baked in.',
    icon: Terminal,
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
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Clone the repo, configure your environment variables, and deploy. All the hard parts are already wired up.
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
