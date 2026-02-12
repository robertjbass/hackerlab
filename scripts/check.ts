import { execSync } from 'child_process'

type Check = {
  name: string
  command: string
}

const checks: Check[] = [
  {
    name: 'Version check',
    command: 'cross-env CALLED_FROM_CHECK=1 tsx scripts/version-check.ts',
  },
  {
    name: 'Lint',
    command:
      'cross-env NODE_OPTIONS=--no-deprecation eslint . --cache --cache-location .eslintcache',
  },
  { name: 'Type check', command: 'pnpm exec tsc --noEmit --pretty' },
]

const results: { name: string; passed: boolean; duration: number }[] = []

for (const check of checks) {
  const start = Date.now()
  process.stdout.write(`\n▶ ${check.name}...\n`)

  try {
    execSync(check.command, { stdio: 'inherit' })
    const duration = Date.now() - start
    results.push({ name: check.name, passed: true, duration })
    console.log(`✓ ${check.name} passed (${(duration / 1000).toFixed(1)}s)`)
  } catch {
    const duration = Date.now() - start
    results.push({ name: check.name, passed: false, duration })
    console.error(`✗ ${check.name} failed (${(duration / 1000).toFixed(1)}s)`)
  }
}

console.log('\n─────────────────────────────')
console.log('Results:\n')

for (const result of results) {
  const icon = result.passed ? '✓' : '✗'
  console.log(
    `  ${icon} ${result.name} (${(result.duration / 1000).toFixed(1)}s)`,
  )
}

const failed = results.filter((r) => !r.passed)
if (failed.length > 0) {
  console.log(`\n${failed.length} check(s) failed.`)
  process.exit(1)
} else {
  console.log(`\nAll checks passed.`)
}
