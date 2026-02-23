import type { Metadata } from 'next'
import {
  LogoTerminalPrompt,
  LogoCodeBrackets,
  LogoHexCircuit,
  LogoStackedLayers,
  LogoAtomOrbital,
  LogoHashMark,
  LogoShieldLock,
  LogoPulseMonitor,
  LogoCurlyBraces,
} from '@/components/logos'
import { ScrollReveal } from '@/components/scroll-reveal'

export const metadata: Metadata = {
  title: 'Logo Concepts — Hackerlab',
  description: 'Potential logo concepts for Hackerlab.',
}

const logos = [
  {
    Component: LogoTerminalPrompt,
    name: 'Terminal Prompt',
    description:
      'A stylized terminal window with a chevron prompt and blinking cursor. Emphasizes the CLI-first developer experience.',
  },
  {
    Component: LogoCodeBrackets,
    name: 'Code Brackets',
    description:
      'Overlapping angle brackets with a forward slash, forming the classic </> code motif. Clean and immediately recognizable.',
  },
  {
    Component: LogoHexCircuit,
    name: 'Hex Circuit',
    description:
      'A hexagonal shell with circuit traces radiating from a central node. Merges the "lab" and "hacker" identities.',
  },
  {
    Component: LogoStackedLayers,
    name: 'Stacked Layers',
    description:
      'Three offset rounded rectangles stacked in perspective, representing the full stack. Depth via decreasing opacity.',
  },
  {
    Component: LogoAtomOrbital,
    name: 'Atom Orbital',
    description:
      'An atom with three elliptical orbits and electrons around a central nucleus. Evokes experimentation and interconnected systems.',
  },
  {
    Component: LogoHashMark,
    name: 'Hash Mark',
    description:
      'A bold # rotated slightly with varied stroke weight, referencing code comments and root prompts. Typographic and raw.',
  },
  {
    Component: LogoShieldLock,
    name: 'Shield Lock',
    description:
      'A shield outline with a keyhole cutout, emphasizing security-first development. Gradient fill adds subtle depth.',
  },
  {
    Component: LogoPulseMonitor,
    name: 'Pulse Monitor',
    description:
      'A heartbeat waveform inside a monitor frame, suggesting live systems, uptime monitoring, and running processes.',
  },
  {
    Component: LogoCurlyBraces,
    name: 'Curly Braces',
    description:
      'A pair of thick curly braces with a center dot, representing an object literal or block scope. Minimal and typographic.',
  },
]

export default function LogosPage() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-50" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto mb-4 h-px w-24 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Logo Concepts
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Nine directions for the Hackerlab mark. Each renders as a single-color SVG
            that inherits <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">currentColor</code>.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {logos.map((logo, index) => (
            <ScrollReveal key={logo.name} delay={index * 100}>
              <div className="group card-glow card-hover-lift relative flex h-full flex-col rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card">
                {/* Preview area */}
                <div className="flex items-center justify-center rounded-t-xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 py-14">
                  <logo.Component className="h-24 w-24 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-2 font-mono text-xs text-primary/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">
                    {logo.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {logo.description}
                  </p>
                </div>

                {/* Color variations strip */}
                <div className="border-t border-border/40 px-6 py-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                    Color variations
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
                      <logo.Component className="h-6 w-6 text-background" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background ring-1 ring-border/50">
                      <logo.Component className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70">
                      <logo.Component className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/90">
                      <logo.Component className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
