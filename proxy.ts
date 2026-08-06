import { updateSession } from '@/lib/supabase/proxy'
import { resolveHost } from '@/lib/sites/host'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Assets internos e o próprio segmento de sites nunca são reescritos.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/sites') ||
    pathname.startsWith('/api')
  ) {
    return await updateSession(request)
  }

  const host = resolveHost(request)

  // Host de corretora (subdomínio ou domínio próprio): serve o site público.
  if (host.type !== 'platform') {
    const url = request.nextUrl.clone()
    const key = host.type === 'subdomain' ? host.slug : host.domain
    url.pathname = `/sites/${encodeURIComponent(key)}${pathname === '/' ? '' : pathname}`

    const response = NextResponse.rewrite(url)
    response.headers.set('x-site-key', key)
    response.headers.set('x-site-type', host.type)
    return response
  }

  // App principal (admin/dashboard/auth): mantém o fluxo de sessão do Supabase.
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
