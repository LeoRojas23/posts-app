import { NextRequest, NextResponse } from 'next/server'

export default async function authMiddleware(req: NextRequest) {
  const response = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  })

  const session = await response.json()

  if (!session) {
    return NextResponse.redirect(new URL('sign-in', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/settings'],
}
