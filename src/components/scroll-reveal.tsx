'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let revealTimer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealTimer = setTimeout(() => {
            el.classList.add('scroll-reveal-visible')
            revealTimer = null
          }, delay)
          if (once) observer.unobserve(el)
        } else if (!once) {
          if (revealTimer) {
            clearTimeout(revealTimer)
            revealTimer = null
          }
          el.classList.remove('scroll-reveal-visible')
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => {
      if (revealTimer) clearTimeout(revealTimer)
      observer.disconnect()
    }
  }, [delay, threshold, once])

  return (
    <div ref={ref} className={cn('scroll-reveal', className)}>
      {children}
    </div>
  )
}
