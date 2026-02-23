'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ClipboardCopy } from '@/components/icons'
import { cn } from '@/lib/cn'

const CLONE_COMMAND = 'git clone https://github.com/robertjbass/hackerlab.git'

export function TerminalClone() {
  const [typedChars, setTypedChars] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < CLONE_COMMAND.length; i++) {
      timers.push(setTimeout(() => setTypedChars(i + 1), 600 + i * 22))
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CLONE_COMMAND)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard API unavailable */
    }
  }, [])

  return (
    <div
      className="group relative mx-auto max-w-xl cursor-pointer select-none overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl transition-colors hover:border-primary/40"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCopy()
        }
      }}
      aria-label="Copy clone command to clipboard"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-slate-500">Terminal</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 transition-colors group-hover:text-slate-400">
          <ClipboardCopy className="h-3 w-3" />
          <span>Click to copy</span>
        </div>
      </div>

      <div className="p-4 font-mono text-sm">
        <div className="flex items-start gap-2">
          <span className="text-primary">$</span>
          <span className="break-all">
            <span className="text-slate-200">
              {CLONE_COMMAND.slice(0, typedChars)}
            </span>
            {typedChars < CLONE_COMMAND.length && (
              <span className="animate-pulse text-slate-200">_</span>
            )}
            <span className="invisible" aria-hidden="true">
              {CLONE_COMMAND.slice(typedChars)}
            </span>
          </span>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300',
          copied
            ? 'bg-slate-950/80 opacity-100'
            : 'bg-slate-950/0 opacity-0',
        )}
      >
        <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
          <Check className="h-4 w-4" />
          Copied to clipboard
        </div>
      </div>
    </div>
  )
}
