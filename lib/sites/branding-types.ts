/** Estado de branding usado pelo estúdio e pelo preview ao vivo (client-safe). */
export interface BrandingState {
  brandColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  headingFont: string
  bodyFont: string
  logoUrl: string | null
  logoDarkUrl: string | null
  faviconUrl: string | null
  heroImageUrl: string | null
  aboutImageUrl: string | null
  heroTitle: string
  heroSubtitle: string
  aboutText: string
  whatsapp: string
  phone: string
  contactEmail: string
  address: string
  appName: string | null
  appIconUrl: string | null
  appSplashUrl: string | null
}

/** Converte uma linha de org_site_settings para o estado do estúdio. */
export function mapSettingsToBranding(s: Record<string, unknown> | null | undefined): BrandingState {
  const str = (k: string) => (typeof s?.[k] === 'string' ? (s[k] as string) : '')
  const nullable = (k: string) => (typeof s?.[k] === 'string' && s[k] ? (s[k] as string) : null)
  return {
    brandColor: str('brand_color') || DEFAULT_BRANDING.brandColor,
    secondaryColor: str('secondary_color') || DEFAULT_BRANDING.secondaryColor,
    accentColor: str('accent_color') || DEFAULT_BRANDING.accentColor,
    backgroundColor: str('background_color') || DEFAULT_BRANDING.backgroundColor,
    headingFont: str('heading_font') || DEFAULT_BRANDING.headingFont,
    bodyFont: str('body_font') || DEFAULT_BRANDING.bodyFont,
    logoUrl: nullable('logo_url'),
    logoDarkUrl: nullable('logo_dark_url'),
    faviconUrl: nullable('favicon_url'),
    heroImageUrl: nullable('hero_image_url'),
    aboutImageUrl: nullable('about_image_url'),
    heroTitle: str('hero_title'),
    heroSubtitle: str('hero_subtitle'),
    aboutText: str('about_text'),
    whatsapp: str('whatsapp'),
    phone: str('phone'),
    contactEmail: str('contact_email'),
    address: str('address'),
    appName: nullable('app_name'),
    appIconUrl: nullable('app_icon_url'),
    appSplashUrl: nullable('app_splash_url'),
  }
}

export const DEFAULT_BRANDING: BrandingState = {
  brandColor: '#2563eb',
  secondaryColor: '#1e293b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  headingFont: 'Geist',
  bodyFont: 'Geist',
  logoUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  heroImageUrl: null,
  aboutImageUrl: null,
  heroTitle: '',
  heroSubtitle: '',
  aboutText: '',
  whatsapp: '',
  phone: '',
  contactEmail: '',
  address: '',
  appName: null,
  appIconUrl: null,
  appSplashUrl: null,
}
