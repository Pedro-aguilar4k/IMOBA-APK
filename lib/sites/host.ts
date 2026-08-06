import type { NextRequest } from 'next/server'

/**
 * Domínio base da plataforma (onde vivem admin/app principal e os subdomínios das corretoras).
 * Ex.: "imobapp.com" -> corretora vira "nomedela.imobapp.com".
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'imobapp.com'

/** Hosts que NÃO são sites de corretora (app principal / admin / preview). */
const RESERVED_HOSTS = new Set(['www', 'app', 'admin', 'api'])

/** Slugs reservados que não podem ser usados por corretoras. */
export const RESERVED_SLUGS = new Set([
  'www',
  'app',
  'admin',
  'api',
  'dashboard',
  'auth',
  'sites',
  '_sites',
  'primeiro-acesso',
  'acesso-pendente',
  'role-select',
])

function stripPort(host: string) {
  return host.split(':')[0].toLowerCase()
}

/**
 * Resolve, a partir do request, qual corretora (por slug ou domínio próprio) deve ser servida.
 * Retorna:
 *  - { type: 'platform' } quando é o app principal (imobapp.com, app.imobapp.com, preview do v0, localhost)
 *  - { type: 'subdomain', slug } quando é nomedela.imobapp.com
 *  - { type: 'custom', domain } quando é um domínio próprio da corretora
 */
export function resolveHost(request: NextRequest):
  | { type: 'platform' }
  | { type: 'subdomain'; slug: string }
  | { type: 'custom'; domain: string } {
  const rawHost = request.headers.get('host') ?? ''
  const host = stripPort(rawHost)

  // Ambientes de desenvolvimento/preview: sempre app principal.
  const isLocal =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.vercel.run') ||
    host.endsWith('.v0.dev') ||
    host.endsWith('.v0.build') ||
    host.endsWith('.lite.vusercontent.net') ||
    host.endsWith('.vusercontent.net')

  if (isLocal) return { type: 'platform' }

  const rootDomain = ROOT_DOMAIN.toLowerCase()

  // Subdomínio da plataforma: <sub>.imobapp.com
  if (host === rootDomain) return { type: 'platform' }
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, host.length - rootDomain.length - 1)
    // subdomínio composto (ex.: a.b.imobapp.com) -> pega o primeiro rótulo
    const label = sub.split('.')[0]
    if (!label || RESERVED_HOSTS.has(label)) return { type: 'platform' }
    return { type: 'subdomain', slug: label }
  }

  // Qualquer outro host é considerado domínio próprio de uma corretora.
  return { type: 'custom', domain: host }
}
