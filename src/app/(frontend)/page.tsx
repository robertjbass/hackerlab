import { auth } from '@/lib/auth'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { CTA } from '@/components/landing/cta'

export default async function HomePage() {
  const session = await auth()
  const loggedIn = !!session?.user

  return (
    <>
      <Hero loggedIn={loggedIn} />
      <Features />
      {!loggedIn && <CTA />}
    </>
  )
}
