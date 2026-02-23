import { NextResponse } from 'next/server'
import { extractThemesFromVsix } from '@/lib/theme/vsix-extract'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { downloadUrl?: string }

    if (!body.downloadUrl || typeof body.downloadUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: downloadUrl' },
        { status: 400 },
      )
    }

    if (!body.downloadUrl.startsWith('https://open-vsx.org/')) {
      return NextResponse.json(
        { error: 'Only open-vsx.org download URLs are allowed' },
        { status: 400 },
      )
    }

    const vsixResponse = await fetch(body.downloadUrl)
    if (!vsixResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download VSIX: ${vsixResponse.status}` },
        { status: 502 },
      )
    }

    const buffer = await vsixResponse.arrayBuffer()
    const themes = await extractThemesFromVsix(buffer)

    if (themes.length === 0) {
      return NextResponse.json(
        { error: 'No themes found in VSIX extension' },
        { status: 404 },
      )
    }

    return NextResponse.json({ themes })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Theme extraction failed',
      },
      { status: 500 },
    )
  }
}
