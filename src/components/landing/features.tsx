import {
  Boxes,
  Code,
  GitBranch,
  Shield,
  Terminal,
  Zap,
} from '@/components/icons'

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
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for developers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tools that integrate seamlessly into your development workflow
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.name}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
