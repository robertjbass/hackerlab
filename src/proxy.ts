import NextAuth from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'

const { auth } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
})

const withAuth = auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export async function proxy(request: NextRequest) {
  return withAuth(request, {} as any)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
