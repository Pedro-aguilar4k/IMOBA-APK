export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

/** Valores monetários no schema estão em centavos (integer). */
export function formatBRLFromCents(cents: number | null | undefined) {
  if (cents == null) return null
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function buildWhatsappLink(whatsapp: string | null, message?: string) {
  if (!whatsapp) return null
  const base = `https://wa.me/55${onlyDigits(whatsapp)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
