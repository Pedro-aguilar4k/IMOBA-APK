import 'server-only'

export const BRANDING_BUCKET = 'org-branding'
export const BRANDING_MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
export const BRANDING_ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]

/**
 * Cada asset de branding corresponde a uma coluna de URL em org_site_settings.
 * `ownerEditable`: se o dono da corretora pode alterar (assets do app são só do superadmin).
 */
export const BRANDING_ASSETS = {
  logo: { column: 'logo_url', ownerEditable: true, label: 'Logo (fundo claro)' },
  logoDark: { column: 'logo_dark_url', ownerEditable: true, label: 'Logo (fundo escuro)' },
  favicon: { column: 'favicon_url', ownerEditable: true, label: 'Favicon' },
  hero: { column: 'hero_image_url', ownerEditable: true, label: 'Imagem de capa (hero)' },
  about: { column: 'about_image_url', ownerEditable: true, label: 'Imagem do Sobre' },
  appIcon: { column: 'app_icon_url', ownerEditable: false, label: 'Ícone do app' },
  appSplash: { column: 'app_splash_url', ownerEditable: false, label: 'Splash do app' },
} as const

export type BrandingAssetKey = keyof typeof BRANDING_ASSETS

export function isBrandingAssetKey(value: string): value is BrandingAssetKey {
  return value in BRANDING_ASSETS
}

/** URL pública de um objeto no bucket de branding. */
export function brandingPublicUrl(supabaseUrl: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BRANDING_BUCKET}/${path}`
}
