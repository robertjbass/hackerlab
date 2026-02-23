import { useId } from 'react'

type LogoProps = {
  className?: string
}

// Logo 1: Terminal Prompt — a stylized ">_" terminal cursor inside a rounded
// rectangle, evoking a CLI window. The prompt chevron and blinking cursor
// underscore are rendered with slight opacity layering for depth.
export function LogoTerminalPrompt({ className = 'h-8 w-8' }: LogoProps) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab terminal prompt logo"
    >
      <defs>
        <linearGradient
          id={`${id}-bg`}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Rounded shell */}
      <rect
        x="2"
        y="4"
        width="28"
        height="24"
        rx="4"
        fill={`url(#${id}-bg)`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      {/* Title bar dots */}
      <circle cx="7" cy="8.5" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="10.5" cy="8.5" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="14" cy="8.5" r="1" fill="currentColor" fillOpacity="0.3" />
      {/* Chevron ">" */}
      <polyline
        points="8,16 13,19.5 8,23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cursor underscore "_" */}
      <line
        x1="15.5"
        y1="23"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  )
}

// Logo 2: Code Brackets — overlapping angle brackets "< />" forming an
// abstract mark. The slash sits at the intersection, creating a sense of
// code structure and precision.
export function LogoCodeBrackets({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab code brackets logo"
    >
      {/* Left bracket "<" */}
      <polyline
        points="12,6 3,16 12,26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      {/* Right bracket ">" */}
      <polyline
        points="20,6 29,16 20,26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      {/* Slash "/" */}
      <line
        x1="19"
        y1="7"
        x2="13"
        y2="25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

// Logo 3: Hex Circuit — a hexagonal shape with internal circuit-like paths
// radiating from a central node, combining the "lab" (chemistry/hex) and
// "hacker" (circuits/tech) motifs.
export function LogoHexCircuit({ className = 'h-8 w-8' }: LogoProps) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab hex circuit logo"
    >
      <defs>
        <linearGradient
          id={`${id}-hex`}
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Hexagon outline */}
      <polygon
        points="16,2 28,9 28,23 16,30 4,23 4,9"
        fill={`url(#${id}-hex)`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      {/* Center node */}
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      {/* Circuit traces radiating outward */}
      <line
        x1="16" y1="13.5" x2="16" y2="5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"
      />
      <line
        x1="18" y1="17.5" x2="25" y2="21.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"
      />
      <line
        x1="14" y1="17.5" x2="7" y2="21.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"
      />
      {/* Outer junction dots */}
      <circle cx="16" cy="4.5" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="25.5" cy="22" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="6.5" cy="22" r="1.5" fill="currentColor" fillOpacity="0.5" />
      {/* Secondary traces */}
      <line
        x1="18.2" y1="15" x2="24" y2="11"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.35"
      />
      <line
        x1="13.8" y1="15" x2="8" y2="11"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.35"
      />
      <line
        x1="16" y1="18.5" x2="16" y2="26"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.35"
      />
    </svg>
  )
}
