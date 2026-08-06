/**
 * Fontes disponíveis no estúdio de personalização.
 * Todas são carregadas via Google Fonts no layout do site público.
 * Mantido leve: poucas famílias, todas com bom desempenho.
 */
export const SITE_FONTS = [
  { value: 'Geist', label: 'Geist (padrão)', stack: "'Geist', sans-serif" },
  { value: 'Inter', label: 'Inter', stack: "'Inter', sans-serif" },
  { value: 'Poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { value: 'Montserrat', label: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { value: 'Playfair Display', label: 'Playfair Display', stack: "'Playfair Display', serif" },
  { value: 'Lora', label: 'Lora', stack: "'Lora', serif" },
  { value: 'Roboto Slab', label: 'Roboto Slab', stack: "'Roboto Slab', serif" },
  { value: 'DM Sans', label: 'DM Sans', stack: "'DM Sans', sans-serif" },
] as const

export type SiteFont = (typeof SITE_FONTS)[number]['value']

export const DEFAULT_FONT: SiteFont = 'Geist'

export function fontStack(value: string | null | undefined): string {
  const found = SITE_FONTS.find((f) => f.value === value)
  return found ? found.stack : SITE_FONTS[0].stack
}

export function isSiteFont(value: string): value is SiteFont {
  return SITE_FONTS.some((f) => f.value === value)
}

/** Monta a URL do Google Fonts para as famílias usadas (dedup + pesos comuns). */
export function googleFontsUrl(fonts: string[]): string | null {
  const families = Array.from(new Set(fonts.filter((f) => f && f !== 'Geist')))
  if (families.length === 0) return null
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
