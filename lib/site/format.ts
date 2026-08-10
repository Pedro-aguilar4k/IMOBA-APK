import type { ListingPurpose } from '@/lib/site/site-data'

/** Formata valor em centavos para BRL. */
export function formatBRL(cents: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    (cents ?? 0) / 100,
  )
}

/** Formata BRL sem centavos (para preços altos de venda). */
export function formatBRLShort(cents: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format((cents ?? 0) / 100)
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  commercial: 'Comercial',
  land: 'Terreno',
  farm: 'Fazenda',
  ranch: 'Sítio',
  chacara: 'Chácara',
  other: 'Imóvel',
}

export function propertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? 'Imóvel'
}

export const PURPOSE_LABELS: Record<ListingPurpose, string> = {
  aluguel: 'Aluguel',
  venda: 'Venda',
  ambos: 'Aluguel e Venda',
}

export function purposeBadge(purpose: ListingPurpose): string {
  if (purpose === 'venda') return 'À venda'
  if (purpose === 'ambos') return 'Venda e aluguel'
  return 'Para alugar'
}

/** Monta link de WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(number: string | null, message: string): string | null {
  if (!number) return null
  const digits = number.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
