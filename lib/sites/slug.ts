import { RESERVED_SLUGS } from './host'

/** Converte um texto livre em um slug seguro (kebab-case, sem acentos). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type SlugValidation = { ok: true; slug: string } | { ok: false; error: string }

/** Valida e normaliza um slug informado manualmente. */
export function validateSlug(input: string): SlugValidation {
  const slug = slugify(input)
  if (slug.length < 3) return { ok: false, error: 'O endereço deve ter pelo menos 3 caracteres.' }
  if (slug.length > 40) return { ok: false, error: 'O endereço deve ter no máximo 40 caracteres.' }
  if (RESERVED_SLUGS.has(slug)) return { ok: false, error: 'Este endereço é reservado. Escolha outro.' }
  return { ok: true, slug }
}

/** Normaliza um domínio próprio (remove protocolo, www, barra e porta). */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
}

const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

export function isValidDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain)
}
