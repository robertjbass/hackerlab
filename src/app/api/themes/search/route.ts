import { NextResponse } from 'next/server'
import { searchOpenVSX } from '@/lib/theme/open-vsx'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string
      offset?: number
    }

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 },
      )
    }

    const offset = body.offset ?? 0
    if (typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset: must be a non-negative integer' },
        { status: 400 },
      )
    }

    const result = await searchOpenVSX(body.query, { offset })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 },
    )
  }
}
