import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')
  cookieStore.delete('authjs.callback-url')
  cookieStore.delete('__Secure-authjs.callback-url')
  cookieStore.delete('payload-token')
  const url = new URL('/', request.url)
  return NextResponse.redirect(url)
}
