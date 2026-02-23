import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { CTA } from '@/components/landing/cta'

export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <CTA />
    </>
  )
}
