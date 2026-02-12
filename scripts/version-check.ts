#!/usr/bin/env tsx

import chalk from 'chalk'
import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

/*
 * Release pages:
 * - Payload: https://github.com/payloadcms/payload/releases
 * - Next.js: https://github.com/vercel/next.js/releases
 * - React: https://github.com/facebook/react/releases
 * - TypeScript: https://github.com/microsoft/TypeScript/releases
 */

const REPEAT_WIDTH = 50
const CONSISTENCY_ONLY = process.argv.includes('--consistency-only')
const SILENT_PASS = !!process.env.CALLED_FROM_CHECK

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

type VersionInfo = {
  packageJson: string | null
  installed: string | null
  latest: string | null
}

type PrereleasePackage = {
  name: string
  version: string
  prereleaseType: string
}

type PrereleaseCheckResult = {
  name: string
  installed: string
  latest: string | null
  prereleaseType: string
  stableAvailable: boolean
}

function loadPackageJson(): PackageJson {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const content = readFileSync(packageJsonPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(
      '❌ Failed to load package.json:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

function getPackageJsonVersion(pkg: PackageJson, name: string): string | null {
  return pkg.dependencies?.[name] || pkg.devDependencies?.[name] || null
}

async function getRegistryVersionAsync(
  pkgName: string,
  tag = 'latest',
): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`pnpm view ${pkgName}@${tag} version`)
    return stdout.trim()
  } catch {
    return null
  }
}

async function getInstalledVersionAsync(
  pkgName: string,
): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`pnpm ls ${pkgName} --depth=0 --json`)
    const parsed = JSON.parse(stdout)
    const deps = parsed[0]?.dependencies || parsed[0]?.devDependencies || {}
    return deps[pkgName]?.version || null
  } catch {
    return null
  }
}

function stripSemverRange(version: string): string {
  return version.replace(/^[\^~>=<]+/, '')
}

function findPrereleasePackages(
  pkg: PackageJson,
  excludeNames: string[] = [],
): PrereleasePackage[] {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  const prereleasePackages: PrereleasePackage[] = []

  for (const [name, version] of Object.entries(allDeps)) {
    if (excludeNames.includes(name)) continue

    const stripped = stripSemverRange(version)
    const parsed = parseVersion(stripped)
    if (parsed?.prerelease) {
      prereleasePackages.push({
        name,
        version: stripped,
        prereleaseType: parsed.prerelease,
      })
    }
  }

  return prereleasePackages
}

type ParsedVersion = {
  major: number
  minor: number
  patch: number
  prerelease: string | null
  prereleaseNum: number | null
}

function parseVersion(version: string): ParsedVersion | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.?(\d+)?)?$/i)
  if (!match) return null

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    prereleaseNum: match[5] ? parseInt(match[5], 10) : null,
  }
}

/**
 * Compare two versions and determine upgrade status.
 * Always recommends stable — never suggests canary/beta/rc builds.
 */
function compareVersions(
  installed: string,
  latest: string,
): 'upgrade-available' | 'stable-available' | 'up-to-date' | 'newer' {
  const inst = parseVersion(installed)
  const lat = parseVersion(latest)

  if (!inst || !lat) {
    console.warn(
      `[version-check] Could not parse versions — installed: "${installed}", latest: "${latest}"`,
    )
    return 'up-to-date'
  }

  const onPrerelease = inst.prerelease !== null
  const latestIsStable = lat.prerelease === null
  const compareCore = (a: ParsedVersion, b: ParsedVersion): number => {
    if (a.major !== b.major) return a.major - b.major
    if (a.minor !== b.minor) return a.minor - b.minor
    return a.patch - b.patch
  }

  // On prerelease? Recommend stable only if same major version exists
  // (e.g., next-auth@5.0.0-beta has no v5 stable — don't recommend v4)
  if (onPrerelease && latestIsStable && inst.major === lat.major) {
    return 'stable-available'
  }

  const coreComparison = compareCore(inst, lat)

  if (latestIsStable && coreComparison < 0) return 'upgrade-available'
  if (coreComparison > 0) return 'newer'
  return 'up-to-date'
}

function formatComparison(name: string, info: VersionInfo): string {
  const packageJsonVer = info.packageJson || 'not specified'
  const installed = info.installed || 'not installed'
  const latest = info.latest || 'unknown'

  const status =
    info.installed && info.latest
      ? compareVersions(info.installed, info.latest)
      : 'up-to-date'

  const lines: string[] = []

  const line1 = `${chalk.bold.cyan(name.padEnd(12))} ${chalk.dim('package.json:')} ${chalk.white(packageJsonVer.padEnd(20))}`

  let line2 = `${''.padEnd(12)} ${chalk.dim('installed:')}    ${chalk.white(installed.padEnd(20))} ${chalk.dim('latest:')} ${chalk.white(latest)}`

  switch (status) {
    case 'upgrade-available':
      line2 += ' ' + chalk.yellow('⚠️  UPDATE AVAILABLE')
      break
    case 'stable-available':
      line2 += ' ' + chalk.red.bold('🚨 STABLE RELEASE AVAILABLE - UPDATE NOW')
      break
    case 'newer':
      line2 += ' ' + chalk.magenta('🔮 (ahead of stable)')
      break
    case 'up-to-date':
      line2 += ' ' + chalk.green('✅')
      break
  }

  lines.push(line1)
  lines.push(line2)

  return lines.join('\n')
}

type ConsistencyCheck = {
  name: string
  packages: { name: string; version: string | null }[]
  consistent: boolean
}

function checkVersionConsistency(
  pkg: PackageJson,
  groupName: string,
  packageNames: string[],
  options: { matchMajorMinor?: boolean } = {},
): ConsistencyCheck {
  const packages = packageNames.map((name) => ({
    name,
    version: getPackageJsonVersion(pkg, name),
  }))
  const presentPackages = packages.filter((p) => p.version !== null)
  const versions = presentPackages.map((p) => {
    const v = stripSemverRange(p.version!)
    if (options.matchMajorMinor) {
      const parsed = parseVersion(v)
      return parsed ? `${parsed.major}.${parsed.minor}` : v
    }
    return v
  })
  const uniqueVersions = [...new Set(versions)]

  return {
    name: groupName,
    packages: presentPackages,
    consistent: uniqueVersions.length <= 1,
  }
}

function checkPrefixConsistency(
  pkg: PackageJson,
  groupName: string,
  prefix: string,
  basePackage: string,
): ConsistencyCheck {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  const prefixPackages = Object.keys(allDeps).filter(
    (name) => name.startsWith(prefix) && name !== basePackage,
  )

  const packages = [basePackage, ...prefixPackages].map((name) => ({
    name,
    version: getPackageJsonVersion(pkg, name),
  }))

  const presentPackages = packages.filter((p) => p.version !== null)
  const versions = presentPackages.map((p) => stripSemverRange(p.version!))
  const uniqueVersions = [...new Set(versions)]

  return {
    name: groupName,
    packages: presentPackages,
    consistent: uniqueVersions.length <= 1,
  }
}

function formatConsistencyCheck(check: ConsistencyCheck): string {
  const lines: string[] = []

  if (check.consistent) {
    lines.push(
      chalk.green('✅') +
        ` ${chalk.bold(check.name)}: ${chalk.dim('all packages on same version')}`,
    )
  } else {
    lines.push(
      chalk.red('❌') +
        ` ${chalk.bold(check.name)}: ${chalk.red.bold('VERSION MISMATCH')}`,
    )
    for (const pkg of check.packages) {
      lines.push(
        `   ${chalk.dim(pkg.name.padEnd(35))} ${chalk.yellow(pkg.version)}`,
      )
    }
  }

  return lines.join('\n')
}

function logConsistencyFailure(consistencyChecks: ConsistencyCheck[]): never {
  console.log(
    '\n' +
      chalk.red.bold(
        '❌ VERSION CHECK FAILED: Package version mismatches detected',
      ),
  )
  console.log('')
  for (const check of consistencyChecks) {
    if (!check.consistent) {
      console.log(`   ${chalk.bold(check.name)}:`)
      for (const pkg of check.packages) {
        console.log(
          `     ${chalk.dim(pkg.name.padEnd(35))} ${chalk.yellow(pkg.version)}`,
        )
      }
      console.log('')
    }
  }
  console.log(
    chalk.dim('   All packages in a group must be on the same version.'),
  )
  console.log(chalk.dim('   Fix the mismatches above before committing.'))
  console.log('')
  process.exit(1)
}

function getPrereleaseStatusText(pkg: PrereleaseCheckResult): string {
  if (pkg.stableAvailable) return chalk.red.bold('🚨 STABLE AVAILABLE')
  if (pkg.latest && compareVersions(pkg.installed, pkg.latest) === 'newer') {
    return chalk.magenta('🔮 (ahead of stable)')
  }
  return chalk.green('✅')
}

type UpgradeItem = {
  name: string
  from: string | null
  to: string | null
  suffix?: string
}

function logUpgradeList(
  title: string,
  items: UpgradeItem[],
  color: 'yellow' | 'magenta',
): void {
  if (items.length === 0) return
  console.log(chalk[color](title))
  for (const { name, from, to, suffix } of items) {
    const line = `   ${chalk.cyan(name.padEnd(15))} ${chalk.dim(from)} ${chalk.yellow('→')} ${chalk.green(to)}${suffix ? ' ' + chalk.dim(suffix) : ''}`
    console.log(line)
  }
  console.log('')
}

async function main() {
  const packageJson = loadPackageJson()

  // Version consistency checks (always run - fast, no network)
  const payloadConsistency = checkPrefixConsistency(
    packageJson,
    'Payload packages',
    '@payloadcms/',
    'payload',
  )

  const reactConsistency = checkVersionConsistency(
    packageJson,
    'React packages',
    ['react', 'react-dom', '@types/react', '@types/react-dom'],
    { matchMajorMinor: true },
  )

  const nextConsistency = checkVersionConsistency(
    packageJson,
    'Next.js packages',
    ['next', '@next/eslint-plugin-next'],
  )

  const lexicalConsistency = checkPrefixConsistency(
    packageJson,
    'Lexical packages',
    '@lexical/',
    'lexical',
  )

  const consistencyChecks = [
    payloadConsistency,
    reactConsistency,
    nextConsistency,
    lexicalConsistency,
  ]
  const hasInconsistency = consistencyChecks.some((check) => !check.consistent)

  if (CONSISTENCY_ONLY) {
    // Fast mode: only check consistency, no network calls
    console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)))
    console.log(
      chalk.bold.white('  VERSION CONSISTENCY ') + chalk.dim('(fast mode)'),
    )
    console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')

    console.log(formatConsistencyCheck(payloadConsistency))
    console.log(formatConsistencyCheck(reactConsistency))
    console.log(formatConsistencyCheck(nextConsistency))
    console.log(formatConsistencyCheck(lexicalConsistency))

    // List prerelease packages (informational, no network)
    const prereleasePackages = findPrereleasePackages(packageJson)
    if (prereleasePackages.length > 0) {
      console.log('\n' + chalk.dim('═'.repeat(REPEAT_WIDTH)))
      console.log(chalk.bold.magenta('  PRERELEASE PACKAGES'))
      console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')
      console.log(
        chalk.red('⚠️  The following packages are on prerelease versions:'),
      )
      for (const pkg of prereleasePackages) {
        console.log(
          `   ${chalk.cyan(pkg.name.padEnd(25))} ${chalk.yellow(pkg.version)} ${chalk.dim(`(${pkg.prereleaseType})`)}`,
        )
      }
      console.log(
        '\n' +
          chalk.dim(
            'Run full check (without --consistency-only) to see if stable versions are available.',
          ),
      )
    }

    if (hasInconsistency) logConsistencyFailure(consistencyChecks)

    if (!SILENT_PASS) {
      console.log(
        '\n' + chalk.green.bold('✅ All consistency checks passed') + '\n',
      )
    }
    return
  }

  // Full mode: fetch versions from registry (only stable tags)
  console.log(chalk.dim('Fetching version information...') + '\n')

  const [
    payloadInstalled,
    payloadLatest,
    nextInstalled,
    nextLatest,
    reactInstalled,
    reactLatest,
    reactDomInstalled,
    reactDomLatest,
    typescriptInstalled,
    typescriptLatest,
  ] = await Promise.all([
    getInstalledVersionAsync('payload'),
    getRegistryVersionAsync('payload'),
    getInstalledVersionAsync('next'),
    getRegistryVersionAsync('next'),
    getInstalledVersionAsync('react'),
    getRegistryVersionAsync('react'),
    getInstalledVersionAsync('react-dom'),
    getRegistryVersionAsync('react-dom'),
    getInstalledVersionAsync('typescript'),
    getRegistryVersionAsync('typescript'),
  ])

  const payload: VersionInfo = {
    packageJson: getPackageJsonVersion(packageJson, 'payload'),
    installed: payloadInstalled,
    latest: payloadLatest,
  }

  const next: VersionInfo = {
    packageJson: getPackageJsonVersion(packageJson, 'next'),
    installed: nextInstalled,
    latest: nextLatest,
  }

  const react: VersionInfo = {
    packageJson: getPackageJsonVersion(packageJson, 'react'),
    installed: reactInstalled,
    latest: reactLatest,
  }

  const reactDom: VersionInfo = {
    packageJson: getPackageJsonVersion(packageJson, 'react-dom'),
    installed: reactDomInstalled,
    latest: reactDomLatest,
  }

  const typescript: VersionInfo = {
    packageJson: getPackageJsonVersion(packageJson, 'typescript'),
    installed: typescriptInstalled,
    latest: typescriptLatest,
  }

  console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)))
  console.log(chalk.bold.white('  VERSION CHECK'))
  console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')

  console.log(formatComparison('payload', payload))
  console.log('')
  console.log(formatComparison('next', next))
  console.log('')
  console.log(formatComparison('react', react))
  console.log('')
  console.log(formatComparison('react-dom', reactDom))
  console.log('')
  console.log(formatComparison('typescript', typescript))

  // Detect prerelease packages (excluding already-tracked ones)
  const prereleasePackages = findPrereleasePackages(packageJson, [
    'next',
    'react',
    'react-dom',
  ])

  const prereleaseResults: PrereleaseCheckResult[] = await Promise.all(
    prereleasePackages.map(async (pkg) => {
      const latest = await getRegistryVersionAsync(pkg.name, 'latest')
      const stableAvailable =
        latest !== null &&
        compareVersions(pkg.version, latest) === 'stable-available'
      return {
        name: pkg.name,
        installed: pkg.version,
        latest,
        prereleaseType: pkg.prereleaseType,
        stableAvailable,
      }
    }),
  )

  if (prereleaseResults.length > 0) {
    console.log('\n' + chalk.dim('═'.repeat(REPEAT_WIDTH)))
    console.log(chalk.bold.magenta('  PRERELEASE PACKAGES'))
    console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')

    for (const pkg of prereleaseResults) {
      console.log(
        `${chalk.cyan(pkg.name.padEnd(25))} ${chalk.yellow(pkg.installed.padEnd(20))} ${chalk.dim('latest:')} ${chalk.white((pkg.latest || 'unknown').padEnd(15))} ${getPrereleaseStatusText(pkg)}`,
      )
    }
  }

  // Version consistency checks
  console.log('\n' + chalk.dim('═'.repeat(REPEAT_WIDTH)))
  console.log(chalk.bold.white('  VERSION CONSISTENCY'))
  console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')

  console.log(formatConsistencyCheck(payloadConsistency))
  console.log(formatConsistencyCheck(reactConsistency))
  console.log(formatConsistencyCheck(nextConsistency))
  console.log(formatConsistencyCheck(lexicalConsistency))

  console.log('\n' + chalk.dim('═'.repeat(REPEAT_WIDTH)))
  console.log(chalk.bold.white('  Release pages:'))
  console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)))
  console.log(
    `  ${chalk.cyan('Payload:')}     ${chalk.dim.underline('https://github.com/payloadcms/payload/releases')}`,
  )
  console.log(
    `  ${chalk.cyan('Next.js:')}     ${chalk.dim.underline('https://github.com/vercel/next.js/releases')}`,
  )
  console.log(
    `  ${chalk.cyan('React:')}       ${chalk.dim.underline('https://github.com/facebook/react/releases')}`,
  )
  console.log(
    `  ${chalk.cyan('TypeScript:')}  ${chalk.dim.underline('https://github.com/microsoft/TypeScript/releases')}`,
  )
  console.log('')

  // Collect all upgrade opportunities
  const corePackages = [
    { name: 'typescript', info: typescript },
    { name: 'payload', info: payload },
    { name: 'react', info: react },
    { name: 'next', info: next },
  ]

  const stableUpgrades = corePackages.filter(
    ({ info }) =>
      info.installed &&
      info.latest &&
      compareVersions(info.installed, info.latest) === 'upgrade-available',
  )

  const coreStableFromPrerelease = corePackages.filter(
    ({ info }) =>
      info.installed &&
      info.latest &&
      compareVersions(info.installed, info.latest) === 'stable-available',
  )

  const prereleaseStableAvailable = prereleaseResults.filter(
    (pkg) => pkg.stableAvailable,
  )

  const hasUpgrades =
    stableUpgrades.length > 0 ||
    coreStableFromPrerelease.length > 0 ||
    prereleaseStableAvailable.length > 0

  if (hasUpgrades) {
    console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)))
    console.log(chalk.bold.yellow('  UPGRADE SUMMARY'))
    console.log(chalk.dim('═'.repeat(REPEAT_WIDTH)) + '\n')

    logUpgradeList(
      '📦 Stable upgrades available:',
      stableUpgrades.map(({ name, info }) => ({
        name,
        from: info.installed,
        to: info.latest,
      })),
      'yellow',
    )

    const prereleaseUpgrades: UpgradeItem[] = [
      ...coreStableFromPrerelease.map(({ name, info }) => ({
        name,
        from: info.installed,
        to: info.latest,
        suffix: '(stable)',
      })),
      ...prereleaseStableAvailable.map((pkg) => ({
        name: pkg.name,
        from: pkg.installed,
        to: pkg.latest,
        suffix: '(stable)',
      })),
    ]
    logUpgradeList(
      '🔄 Stable releases for prerelease packages:',
      prereleaseUpgrades,
      'magenta',
    )

    console.log(
      chalk.dim('Run:') + ' ' + chalk.white('pnpm update <package>@latest'),
    )
    console.log('')
  }

  if (hasInconsistency) logConsistencyFailure(consistencyChecks)

  if (!SILENT_PASS) {
    console.log(chalk.green.bold('✅ All version checks passed') + '\n')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
