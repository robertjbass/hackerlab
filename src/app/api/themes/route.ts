import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { NextResponse } from 'next/server'
import type { VSCodeTheme, ActiveThemeConfig } from '@/lib/theme/types'
import { extractPreviewColors } from '@/lib/theme/vsix-extract'

const THEMES_DIR = resolve(process.cwd(), 'src/themes')
const ACTIVE_CONFIG = resolve(THEMES_DIR, 'active.json')

export async function GET() {
  if (!existsSync(THEMES_DIR)) {
    return NextResponse.json({ themes: [], active: {}, isDev: process.env.NODE_ENV !== 'production' })
  }

  const files = readdirSync(THEMES_DIR).filter(
    (f) => f.endsWith('.json') && f !== 'active.json',
  )

  const themes = files.map((file) => {
    const raw = readFileSync(resolve(THEMES_DIR, file), 'utf-8')
    const parsed = JSON.parse(raw) as VSCodeTheme
    return {
      slug: file.replace('.json', ''),
      name: parsed.name || file.replace('.json', ''),
      type: parsed.type === 'light' ? ('light' as const) : ('dark' as const),
      previewColors: extractPreviewColors(parsed.colors),
    }
  })

  let active: ActiveThemeConfig = {}
  if (existsSync(ACTIVE_CONFIG)) {
    try {
      active = JSON.parse(readFileSync(ACTIVE_CONFIG, 'utf-8'))
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    themes,
    active,
    isDev: process.env.NODE_ENV !== 'production',
  })
}
