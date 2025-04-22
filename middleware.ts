import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (req.nextUrl.pathname.startsWith('/panel') && !session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }
  if (req.nextUrl.pathname.startsWith('/banco/panel') && !session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/banco/login'
    return NextResponse.redirect(loginUrl)
  }
  return res
}

export const config = {
  matcher: ['/panel/:path*', '/panel', '/banco/panel/:path*', '/banco/panel']
}
