import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'
import { getClientIp, limitLoginIp, rateLimitHeaders } from '@/lib/security/rate-limit'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login' && request.method === 'POST') {
    const result = await limitLoginIp(getClientIp(request.headers))
    if (!result.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um momento e tente novamente.' },
        { status: 429, headers: rateLimitHeaders(result) },
      )
    }
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
