import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function isValidOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const requestUrl = new URL(request.url)
  const expectedOrigin = requestUrl.origin

  if (origin) return origin === expectedOrigin
  if (referer) return new URL(referer).origin === expectedOrigin
  return false
}

export async function POST(request: Request) {
  if (!isValidOrigin(request)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const cookieStore = await cookies()
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')
  cookieStore.delete('authjs.callback-url')
  cookieStore.delete('__Secure-authjs.callback-url')
  cookieStore.delete('payload-token')
  cookieStore.delete('oauth-redirect-to')
  cookieStore.delete('oauth-callback-url')
  const url = new URL('/', request.url)
  return NextResponse.redirect(url)
}
