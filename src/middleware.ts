import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

// Edge-compatible auth for middleware — only validates JWT sessions.
// Full auth config with Payload adapter lives in src/lib/auth/.
// Providers are not needed for JWT validation; AUTH_SECRET is read from env.
const { auth } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
})

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
