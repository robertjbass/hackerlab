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

    let parsedUrl: URL
    try {
      parsedUrl = new URL(body.downloadUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 },
      )
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'open-vsx.org') {
      return NextResponse.json(
        { error: 'Only https://open-vsx.org download URLs are allowed' },
        { status: 400 },
      )
    }

    const MAX_VSIX_SIZE = 50 * 1024 * 1024 // 50 MB
    const DOWNLOAD_TIMEOUT = 30_000 // 30s

    const downloadController = new AbortController()
    const downloadTimer = setTimeout(() => downloadController.abort(), DOWNLOAD_TIMEOUT)

    let vsixResponse: Response
    try {
      vsixResponse = await fetch(body.downloadUrl, { signal: downloadController.signal })
    } catch (error) {
      clearTimeout(downloadTimer)
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'VSIX download timed out'
        : 'VSIX download failed'
      return NextResponse.json({ error: message }, { status: 408 })
    }
    clearTimeout(downloadTimer)

    if (!vsixResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download VSIX: ${vsixResponse.status}` },
        { status: 502 },
      )
    }

    const contentLength = Number(vsixResponse.headers.get('content-length'))
    if (contentLength && contentLength > MAX_VSIX_SIZE) {
      return NextResponse.json(
        { error: `VSIX too large (${Math.round(contentLength / 1024 / 1024)}MB, max 50MB)` },
        { status: 413 },
      )
    }

    const buffer = await vsixResponse.arrayBuffer()
    if (buffer.byteLength > MAX_VSIX_SIZE) {
      return NextResponse.json(
        { error: `VSIX too large (${Math.round(buffer.byteLength / 1024 / 1024)}MB, max 50MB)` },
        { status: 413 },
      )
    }
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
