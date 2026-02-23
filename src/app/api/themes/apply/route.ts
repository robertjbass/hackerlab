import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from 'fs'
import { resolve } from 'path'
import { NextResponse } from 'next/server'
import type { VSCodeTheme, ActiveThemeConfig } from '@/lib/theme/types'
import { resolveTheme } from '@/lib/theme/theme-resolver'
import { rewriteGlobalsCss } from '@/lib/theme/css-writer'

const ROOT = process.cwd()
const GLOBALS_CSS = resolve(ROOT, 'src/app/globals.css')
const GLOBALS_BACKUP = GLOBALS_CSS + '.backup'
const THEMES_DIR = resolve(ROOT, 'src/themes')
const ACTIVE_CONFIG = resolve(THEMES_DIR, 'active.json')

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Theme application is only available in development' },
      { status: 403 },
    )
  }

  try {
    const body = (await request.json()) as {
      slug?: string
      theme?: VSCodeTheme
      mode: 'light' | 'dark' | 'both'
    }

    if (!body.mode || !['light', 'dark', 'both'].includes(body.mode)) {
      return NextResponse.json(
        { error: 'Missing or invalid field: mode (light | dark | both)' },
        { status: 400 },
      )
    }

    let theme: VSCodeTheme
    let slug: string

    if (body.slug) {
      const themePath = resolve(THEMES_DIR, `${body.slug}.json`)
      if (!existsSync(themePath)) {
        return NextResponse.json(
          { error: `Theme not found: ${body.slug}` },
          { status: 404 },
        )
      }
      const raw = readFileSync(themePath, 'utf-8')
      theme = JSON.parse(raw) as VSCodeTheme
      slug = body.slug
    } else if (body.theme) {
      if (!body.theme.colors || typeof body.theme.colors !== 'object') {
        return NextResponse.json(
          { error: 'Invalid theme: missing colors object' },
          { status: 400 },
        )
      }
      theme = body.theme
      slug = slugify(theme.name || 'custom-theme')

      const themePath = resolve(THEMES_DIR, `${slug}.json`)
      if (!existsSync(themePath)) {
        writeFileSync(themePath, JSON.stringify(theme, null, 2) + '\n')
      }
    } else {
      return NextResponse.json(
        { error: 'Must provide either slug or theme' },
        { status: 400 },
      )
    }

    if (!existsSync(GLOBALS_BACKUP)) {
      copyFileSync(GLOBALS_CSS, GLOBALS_BACKUP)
    }

    const modes: Array<'light' | 'dark'> =
      body.mode === 'both' ? ['light', 'dark'] : [body.mode]

    let cssContent = readFileSync(GLOBALS_CSS, 'utf-8')

    for (const mode of modes) {
      const vars = resolveTheme(theme, mode)
      cssContent = rewriteGlobalsCss(cssContent, mode, vars)
    }

    writeFileSync(GLOBALS_CSS, cssContent)

    const active: ActiveThemeConfig = existsSync(ACTIVE_CONFIG)
      ? JSON.parse(readFileSync(ACTIVE_CONFIG, 'utf-8'))
      : {}

    for (const mode of modes) {
      active[mode] = { name: theme.name, slug }
    }
    writeFileSync(ACTIVE_CONFIG, JSON.stringify(active, null, 2) + '\n')

    return NextResponse.json({
      success: true,
      applied: { modes, themeName: theme.name, slug },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Theme application failed',
      },
      { status: 500 },
    )
  }
}
