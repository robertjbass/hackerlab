#!/usr/bin/env tsx
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  copyFileSync,
  unlinkSync,
} from 'fs'
import { resolve, basename, join } from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'
import { parseArgs } from 'util'
import chalk from 'chalk'

import type { VSCodeTheme, ActiveThemeConfig } from '../src/lib/theme/types'
import { resolveTheme } from '../src/lib/theme/theme-resolver'
import { rewriteGlobalsCss } from '../src/lib/theme/css-writer'

const ROOT = resolve(import.meta.dirname, '..')
const GLOBALS_CSS = resolve(ROOT, 'src/app/globals.css')
const GLOBALS_BACKUP = GLOBALS_CSS + '.backup'
const THEMES_DIR = resolve(ROOT, 'src/themes')
const ACTIVE_CONFIG = resolve(THEMES_DIR, 'active.json')

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    file: { type: 'string', short: 'f' },
    url: { type: 'string', short: 'u' },
    vscode: { type: 'string', short: 'v' },
    mode: { type: 'string', short: 'm' },
    both: { type: 'boolean', short: 'b' },
    list: { type: 'boolean', short: 'l' },
    restore: { type: 'boolean', short: 'r' },
    'dry-run': { type: 'boolean', short: 'd' },
    name: { type: 'string', short: 'n' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function stripJsonComments(text: string): string {
  // Remove single-line // comments (but not inside strings)
  return text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')
}

function parseThemeJson(raw: string, sourceName: string): VSCodeTheme {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(stripJsonComments(raw))
  } catch {
    console.error(chalk.red(`Failed to parse JSON from ${sourceName}`))
    process.exit(1)
  }

  if (!parsed.colors || typeof parsed.colors !== 'object') {
    console.error(chalk.red(`Theme JSON missing "colors" object`))
    process.exit(1)
  }

  const name = (parsed.name as string) || sourceName
  const type =
    parsed.type === 'light' ? ('light' as const) : ('dark' as const)

  return {
    name,
    type,
    colors: parsed.colors as VSCodeTheme['colors'],
    tokenColors: parsed.tokenColors as VSCodeTheme['tokenColors'],
  }
}

function loadActiveConfig(): ActiveThemeConfig {
  if (!existsSync(ACTIVE_CONFIG)) return {}
  try {
    return JSON.parse(readFileSync(ACTIVE_CONFIG, 'utf-8'))
  } catch {
    return {}
  }
}

function saveActiveConfig(config: ActiveThemeConfig) {
  writeFileSync(ACTIVE_CONFIG, JSON.stringify(config, null, 2) + '\n')
}

function printColorTable(vars: Record<string, string>) {
  const maxLen = Math.max(...Object.keys(vars).map((k) => k.length))
  for (const [name, value] of Object.entries(vars)) {
    console.log(`  ${chalk.cyan(name.padEnd(maxLen))}  ${value}`)
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function showHelp() {
  console.log(`
${chalk.bold('Usage:')}
  pnpm import-theme --file <path>       Import from local JSON file
  pnpm import-theme --url <url>         Import from URL (raw JSON)
  pnpm import-theme --vscode <name>     Search VS Code marketplace
  pnpm import-theme --list              Show bundled/imported themes
  pnpm import-theme --restore           Restore globals.css from backup

${chalk.bold('Options:')}
  --mode <light|dark>   Which CSS block to write (auto-detected if omitted)
  --both                Write to both :root and .dark blocks
  --dry-run             Print mapping without writing
  --name <name>         Theme name for VSIX with multiple themes
  --help                Show this help message
`)
}

function listThemes() {
  const files = readdirSync(THEMES_DIR).filter(
    (f) => f.endsWith('.json') && f !== 'active.json',
  )

  if (files.length === 0) {
    console.log(chalk.yellow('No themes found in src/themes/'))
    return
  }

  const active = loadActiveConfig()

  console.log(chalk.bold('\nAvailable themes:\n'))
  for (const file of files) {
    const raw = readFileSync(resolve(THEMES_DIR, file), 'utf-8')
    const theme = parseThemeJson(raw, file)
    const slug = file.replace('.json', '')
    const isActiveLight = active.light?.slug === slug
    const isActiveDark = active.dark?.slug === slug

    let badge = ''
    if (isActiveLight && isActiveDark) badge = chalk.green(' [active: both]')
    else if (isActiveLight) badge = chalk.green(' [active: light]')
    else if (isActiveDark) badge = chalk.green(' [active: dark]')

    const typeLabel =
      theme.type === 'dark' ? chalk.blue('dark') : chalk.yellow('light')

    console.log(`  ${chalk.white(theme.name)} (${typeLabel})${badge}`)
    console.log(`    ${chalk.dim(file)}`)
  }
  console.log()
}

function restoreBackup() {
  if (!existsSync(GLOBALS_BACKUP)) {
    console.error(chalk.red('No backup found at src/app/globals.css.backup'))
    process.exit(1)
  }

  copyFileSync(GLOBALS_BACKUP, GLOBALS_CSS)
  console.log(chalk.green('Restored globals.css from backup'))
}

async function fetchThemeFromUrl(url: string): Promise<string> {
  const ora = (await import('ora')).default
  const spinner = ora('Downloading theme...').start()
  try {
    const response = await fetch(url)
    if (!response.ok) {
      spinner.fail(`HTTP ${response.status}: ${response.statusText}`)
      process.exit(1)
    }
    const text = await response.text()
    spinner.succeed('Downloaded theme')
    return text
  } catch (error) {
    spinner.fail(`Download failed: ${error}`)
    process.exit(1)
  }
}

async function searchVscodeMarketplace(query: string): Promise<string> {
  const ora = (await import('ora')).default
  const inquirer = (await import('inquirer')).default

  const spinner = ora(`Searching marketplace for "${query}"...`).start()

  const body = {
    filters: [
      {
        criteria: [
          { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
          { filterType: 10, value: query },
          { filterType: 12, value: '5' }, // Themes category
        ],
        pageNumber: 1,
        pageSize: 10,
        sortBy: 0,
        sortOrder: 0,
      },
    ],
    assetTypes: [],
    flags: 914,
  }

  const response = await fetch(
    'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json;api-version=3.0-preview.1',
      },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    spinner.fail(`Marketplace search failed: ${response.status}`)
    process.exit(1)
  }

  const data = (await response.json()) as {
    results: Array<{
      extensions: Array<{
        displayName: string
        publisher: { publisherName: string }
        versions: Array<{
          version: string
          files: Array<{ assetType: string; source: string }>
        }>
      }>
    }>
  }

  const extensions = data.results?.[0]?.extensions ?? []
  if (extensions.length === 0) {
    spinner.fail('No theme extensions found')
    process.exit(1)
  }

  spinner.succeed(`Found ${extensions.length} extensions`)

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select an extension:',
      choices: extensions.map((ext, i) => ({
        name: `${ext.displayName} (${ext.publisher.publisherName})`,
        value: i,
      })),
    },
  ])

  const ext = extensions[choice]
  const vsixAsset = ext.versions[0]?.files?.find(
    (f) => f.assetType === 'Microsoft.VisualStudio.Services.VSIXPackage',
  )

  if (!vsixAsset) {
    console.error(chalk.red('Could not find VSIX download URL'))
    process.exit(1)
  }

  const vsixSpinner = ora('Downloading VSIX...').start()

  const vsixResponse = await fetch(vsixAsset.source)
  if (!vsixResponse.ok) {
    vsixSpinner.fail('VSIX download failed')
    process.exit(1)
  }

  const tmpFile = join(tmpdir(), `theme-${Date.now()}.vsix`)
  const buffer = Buffer.from(await vsixResponse.arrayBuffer())
  writeFileSync(tmpFile, buffer)
  vsixSpinner.succeed('Downloaded VSIX')

  const listOutput = execSync(`unzip -l "${tmpFile}"`, {
    encoding: 'utf-8',
  })

  // Find theme contribution files (typically in extension/themes/*.json)
  const themeFiles = listOutput
    .split('\n')
    .map((line) => line.trim().split(/\s+/).pop() ?? '')
    .filter(
      (f) =>
        f.match(/themes\/.*\.json$/i) ||
        f.match(/theme\/.*\.json$/i) ||
        f.match(/.*-color-theme\.json$/i),
    )

  if (themeFiles.length === 0) {
    // Fallback: look at package.json for theme contributions
    let pkgJson: string
    try {
      pkgJson = execSync(
        `unzip -p "${tmpFile}" "extension/package.json" 2>/dev/null`,
        { encoding: 'utf-8' },
      )
    } catch {
      console.error(chalk.red('No theme files found in VSIX'))
      process.exit(1)
    }

    const pkg = JSON.parse(pkgJson)
    const contributions = pkg.contributes?.themes ?? []
    for (const theme of contributions) {
      if (theme.path) {
        themeFiles.push(`extension/${theme.path.replace('./', '')}`)
      }
    }

    if (themeFiles.length === 0) {
      console.error(chalk.red('No theme files found in VSIX'))
      process.exit(1)
    }
  }

  let selectedFile = themeFiles[0]

  if (themeFiles.length > 1) {
    // If --name was specified, try to match it
    if (args.name) {
      const nameMatch = themeFiles.find((f) =>
        f.toLowerCase().includes(args.name!.toLowerCase()),
      )
      if (nameMatch) {
        selectedFile = nameMatch
      } else {
        console.log(
          chalk.yellow(
            `No file matching "${args.name}", showing all options...`,
          ),
        )
      }
    }

    if (!args.name || selectedFile === themeFiles[0]) {
      const { themeChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'themeChoice',
          message: 'Extension contains multiple themes. Select one:',
          choices: themeFiles.map((f) => ({
            name: basename(f).replace('.json', ''),
            value: f,
          })),
        },
      ])
      selectedFile = themeChoice
    }
  }

  const themeJson = execSync(`unzip -p "${tmpFile}" "${selectedFile}"`, {
    encoding: 'utf-8',
  })

  try {
    unlinkSync(tmpFile)
  } catch {
    // ignore cleanup failures
  }

  return themeJson
}

async function applyTheme(
  theme: VSCodeTheme,
  options: { mode?: string; both?: boolean; dryRun?: boolean },
) {
  const detectedMode = theme.type
  const modes: Array<'light' | 'dark'> = []

  if (options.both) {
    modes.push('light', 'dark')
  } else if (options.mode === 'light' || options.mode === 'dark') {
    modes.push(options.mode)
  } else {
    modes.push(detectedMode)
  }

  console.log(
    chalk.dim(
      `\nTheme: ${theme.name} (${theme.type}) → writing to: ${modes.join(', ')}`,
    ),
  )

  let cssContent = readFileSync(GLOBALS_CSS, 'utf-8')

  for (const mode of modes) {
    const vars = resolveTheme(theme, mode)

    if (options.dryRun) {
      console.log(chalk.bold(`\n${mode === 'light' ? ':root' : '.dark'} mappings:\n`))
      printColorTable(vars)
      continue
    }

    cssContent = rewriteGlobalsCss(cssContent, mode, vars)
  }

  if (options.dryRun) {
    console.log(chalk.dim('\n(dry run - no files modified)'))
    return
  }

  // Backup before writing
  if (!existsSync(GLOBALS_BACKUP)) {
    copyFileSync(GLOBALS_CSS, GLOBALS_BACKUP)
    console.log(chalk.dim('Created backup at src/app/globals.css.backup'))
  }

  writeFileSync(GLOBALS_CSS, cssContent)
  console.log(chalk.green('\nUpdated src/app/globals.css'))

  // Save theme to src/themes/ if not already there
  const slug = slugify(theme.name)
  const themePath = resolve(THEMES_DIR, `${slug}.json`)
  if (!existsSync(themePath)) {
    writeFileSync(themePath, JSON.stringify(theme, null, 2) + '\n')
    console.log(chalk.dim(`Saved theme to src/themes/${slug}.json`))
  }

  // Update active.json
  const active = loadActiveConfig()
  for (const mode of modes) {
    active[mode] = { name: theme.name, slug }
  }
  saveActiveConfig(active)
  console.log(chalk.dim('Updated src/themes/active.json'))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (args.help) {
    showHelp()
    return
  }

  if (args.list) {
    listThemes()
    return
  }

  if (args.restore) {
    restoreBackup()
    return
  }

  let raw: string

  if (args.file) {
    const filePath = resolve(args.file)
    if (!existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`))
      process.exit(1)
    }
    raw = readFileSync(filePath, 'utf-8')
  } else if (args.url) {
    raw = await fetchThemeFromUrl(args.url)
  } else if (args.vscode) {
    raw = await searchVscodeMarketplace(args.vscode)
  } else {
    await showHelp()
    return
  }

  const theme = parseThemeJson(raw, args.file ?? args.url ?? args.vscode ?? 'theme')

  await applyTheme(theme, {
    mode: args.mode,
    both: args.both,
    dryRun: args['dry-run'],
  })
}

main().catch((error) => {
  console.error(chalk.red(error))
  process.exit(1)
})
