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

// Logo 4: Stacked Layers — three offset rounded rectangles stacked in
// perspective, representing the "stack" a hacker works across (frontend,
// backend, infra). Decreasing opacity from front to back gives depth.
export function LogoStackedLayers({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab stacked layers logo"
    >
      {/* Back layer */}
      <rect
        x="7" y="4" width="20" height="14" rx="3"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25"
        fill="currentColor" fillOpacity="0.04"
      />
      {/* Middle layer */}
      <rect
        x="5" y="9" width="22" height="14" rx="3"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5"
        fill="currentColor" fillOpacity="0.08"
      />
      {/* Front layer */}
      <rect
        x="3" y="14" width="26" height="14" rx="3"
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.85"
        fill="currentColor" fillOpacity="0.12"
      />
      {/* Code line on front layer */}
      <line
        x1="7" y1="19" x2="14" y2="19"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"
      />
      <line
        x1="7" y1="23" x2="18" y2="23"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35"
      />
    </svg>
  )
}

// Logo 5: Beaker Flask — a chemistry Erlenmeyer flask with bubbles
// rising inside. Directly references the "lab" in Hackerlab.
export function LogoBeakerFlask({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab beaker flask logo"
    >
      {/* Flask neck */}
      <line
        x1="13" y1="3" x2="13" y2="12"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
      <line
        x1="19" y1="3" x2="19" y2="12"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Neck rim */}
      <line
        x1="11" y1="3" x2="21" y2="3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"
      />
      {/* Flask body — tapers from neck to wide base */}
      <path
        d="M13 12 L6 25 Q5 28 8 28 L24 28 Q27 28 26 25 L19 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Liquid level */}
      <path
        d="M8.5 22 L23.5 22 L26 25 Q27 28 24 28 L8 28 Q5 28 6 25 Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Bubbles */}
      <circle cx="13" cy="25" r="1.2" fill="currentColor" fillOpacity="0.35" />
      <circle cx="18" cy="24" r="0.9" fill="currentColor" fillOpacity="0.25" />
      <circle cx="11" cy="19" r="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="18" cy="17.5" r="0.75" fill="currentColor" fillOpacity="0.25" />
      <circle cx="14.5" cy="16" r="0.5" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}

// Logo 5b: Atom Orbital — an atom with three elliptical orbits and a
// central nucleus, evoking experimentation and science. A "lab" motif
// that also suggests interconnected systems.
export function LogoAtomOrbital({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab atom orbital logo"
    >
      {/* Nucleus */}
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      {/* Orbit 1 — horizontal ellipse */}
      <ellipse
        cx="16" cy="16" rx="13" ry="5"
        stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.6"
      />
      {/* Orbit 2 — rotated 60° */}
      <ellipse
        cx="16" cy="16" rx="13" ry="5"
        stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.45"
        transform="rotate(60 16 16)"
      />
      {/* Orbit 3 — rotated 120° */}
      <ellipse
        cx="16" cy="16" rx="13" ry="5"
        stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.3"
        transform="rotate(120 16 16)"
      />
      {/* Electrons */}
      <circle cx="29" cy="16" r="1.2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="9.5" cy="5" r="1.2" fill="currentColor" fillOpacity="0.35" />
      <circle cx="9.5" cy="27" r="1.2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

// Logo 6: Hash Symbol — a bold "#" (hash/pound) rotated slightly,
// referencing both code comments and command-line root prompts.
// The strokes have varying weight for a hand-lettered feel.
export function LogoHashMark({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab hash mark logo"
    >
      <g transform="rotate(-8 16 16)">
        {/* Vertical strokes */}
        <line
          x1="12" y1="4" x2="10" y2="28"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        />
        <line
          x1="22" y1="4" x2="20" y2="28"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8"
        />
        {/* Horizontal strokes */}
        <line
          x1="5" y1="12" x2="27" y2="10"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85"
        />
        <line
          x1="5" y1="22" x2="27" y2="20"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.65"
        />
      </g>
    </svg>
  )
}

// Logo 7: Shield Lock — a shield outline with a keyhole cutout,
// emphasizing security-first development. The keyhole is rendered
// as a circle above a tapered slot.
export function LogoShieldLock({ className = 'h-8 w-8' }: LogoProps) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab shield lock logo"
    >
      <defs>
        <linearGradient
          id={`${id}-sh`}
          x1="16" y1="2" x2="16" y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path
        d="M16 2 L28 7 L28 16 C28 23 22 28 16 30 C10 28 4 23 4 16 L4 7 Z"
        fill={`url(#${id}-sh)`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />
      {/* Keyhole circle */}
      <circle cx="16" cy="14" r="3" fill="currentColor" fillOpacity="0.7" />
      {/* Keyhole slot */}
      <path
        d="M14.5 16 L16 23 L17.5 16 Z"
        fill="currentColor" fillOpacity="0.5"
      />
    </svg>
  )
}

// Logo 8: Pulse Monitor — a horizontal heartbeat / data pulse line
// inside a rounded rectangle, suggesting live monitoring, uptime,
// and the energy of a running system.
export function LogoPulseMonitor({ className = 'h-8 w-8' }: LogoProps) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab pulse monitor logo"
    >
      <defs>
        <linearGradient
          id={`${id}-pm`}
          x1="0" y1="0" x2="32" y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Monitor frame */}
      <rect
        x="2" y="5" width="28" height="22" rx="4"
        fill={`url(#${id}-pm)`}
        stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55"
      />
      {/* Pulse waveform */}
      <polyline
        points="5,18 9,18 11,18 13,10 15,24 17,8 19,20 21,14 23,18 27,18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Subtle scan line */}
      <line
        x1="5" y1="18" x2="27" y2="18"
        stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15"
      />
    </svg>
  )
}

// Logo 9: Curly Braces — a pair of thick curly braces "{ }" with a
// dot in the center, representing an object literal / block scope.
// Minimal and typographic.
export function LogoCurlyBraces({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hackerlab curly braces logo"
    >
      {/* Left brace "{" */}
      <path
        d="M12 4 Q8 4 8 8 L8 13 Q8 16 5 16 Q8 16 8 19 L8 24 Q8 28 12 28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right brace "}" */}
      <path
        d="M20 4 Q24 4 24 8 L24 13 Q24 16 27 16 Q24 16 24 19 L24 24 Q24 28 20 28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.75"
      />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill="currentColor" fillOpacity="0.8" />
    </svg>
  )
}
