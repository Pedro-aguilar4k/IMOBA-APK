import type { SiteOrganization } from './site-data'

export type SiteSectionKey = 'featured' | 'buyRent' | 'about' | 'contact'

export interface SiteCustomization {
  brand: {
    displayName: string
    tagline: string
    logoUrl: string
    primaryColor: string
    phone: string
    whatsapp: string
    email: string
    instagram: string
    creci: string
  }
  hero: {
    eyebrow: string
    title: string
    highlight: string
    description: string
    imageUrl: string
    ctaLabel: string
  }
  sections: {
    featured: { enabled: boolean; eyebrow: string; title: string; description: string }
    buyRent: { enabled: boolean; title: string; description: string }
    about: { enabled: boolean; eyebrow: string; title: string; body: string }
    contact: { enabled: boolean; eyebrow: string; title: string; description: string }
  }
  seo: { title: string; description: string }
}

export const DEFAULT_SITE_CUSTOMIZATION: SiteCustomization = {
  brand: {
    displayName: '',
    tagline: 'Seu próximo endereço começa aqui.',
    logoUrl: '',
    primaryColor: '#155eef',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    creci: '',
  },
  hero: {
    eyebrow: 'Imóveis que combinam com a sua vida',
    title: 'Encontre o lugar onde sua próxima história começa.',
    highlight: 'sua próxima história',
    description: 'Curadoria de imóveis para comprar e alugar, com atendimento próximo em cada etapa.',
    imageUrl: '/site-demo/hero.png',
    ctaLabel: 'Explorar imóveis',
  },
  sections: {
    featured: {
      enabled: true,
      eyebrow: 'Seleção especial',
      title: 'Imóveis em destaque',
      description: 'Uma seleção atualizada para você encontrar seu próximo endereço com mais facilidade.',
    },
    buyRent: {
      enabled: true,
      title: 'Escolha seu próximo capítulo',
      description: 'Do primeiro apartamento à casa dos sonhos, estamos aqui para encontrar o imóvel certo para você.',
    },
    about: {
      enabled: true,
      eyebrow: 'Por que escolher a gente',
      title: 'Atendimento que entende o que você procura.',
      body: 'Somos especialistas em conectar pessoas a espaços que fazem sentido para suas vidas. Nossa equipe acompanha cada detalhe para que sua experiência seja segura, clara e tranquila.',
    },
    contact: {
      enabled: true,
      eyebrow: 'Vamos conversar',
      title: 'Seu próximo endereço pode estar mais perto do que você imagina.',
      description: 'Conte o que você procura e nossa equipe entra em contato com uma seleção feita para você.',
    },
  },
  seo: { title: '', description: '' },
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function getSiteCustomization(
  organization: Pick<SiteOrganization, 'name' | 'tagline' | 'logo_url' | 'hero_image_url' | 'phone' | 'whatsapp' | 'email' | 'instagram' | 'creci' | 'primary_color' | 'about'>,
  raw: unknown = {},
): SiteCustomization {
  const source = objectOrEmpty(raw)
  const brand = objectOrEmpty(source.brand)
  const hero = objectOrEmpty(source.hero)
  const sections = objectOrEmpty(source.sections)
  const seo = objectOrEmpty(source.seo)
  const defaultBrand = DEFAULT_SITE_CUSTOMIZATION.brand
  const defaultHero = DEFAULT_SITE_CUSTOMIZATION.hero

  return {
    brand: {
      displayName: String(brand.displayName ?? organization.name),
      tagline: String(brand.tagline ?? organization.tagline ?? defaultBrand.tagline),
      logoUrl: String(brand.logoUrl ?? organization.logo_url ?? ''),
      primaryColor: String(brand.primaryColor ?? organization.primary_color ?? defaultBrand.primaryColor),
      phone: String(brand.phone ?? organization.phone ?? ''),
      whatsapp: String(brand.whatsapp ?? organization.whatsapp ?? ''),
      email: String(brand.email ?? organization.email ?? ''),
      instagram: String(brand.instagram ?? organization.instagram ?? ''),
      creci: String(brand.creci ?? organization.creci ?? ''),
    },
    hero: {
      eyebrow: String(hero.eyebrow ?? defaultHero.eyebrow),
      title: String(hero.title ?? defaultHero.title),
      highlight: String(hero.highlight ?? defaultHero.highlight),
      description: String(hero.description ?? defaultHero.description),
      imageUrl: String(hero.imageUrl ?? organization.hero_image_url ?? defaultHero.imageUrl),
      ctaLabel: String(hero.ctaLabel ?? defaultHero.ctaLabel),
    },
    sections: {
      featured: { ...DEFAULT_SITE_CUSTOMIZATION.sections.featured, ...objectOrEmpty(sections.featured) },
      buyRent: { ...DEFAULT_SITE_CUSTOMIZATION.sections.buyRent, ...objectOrEmpty(sections.buyRent) },
      about: { ...DEFAULT_SITE_CUSTOMIZATION.sections.about, ...objectOrEmpty(sections.about) },
      contact: { ...DEFAULT_SITE_CUSTOMIZATION.sections.contact, ...objectOrEmpty(sections.contact) },
    },
    seo: {
      title: String(seo.title ?? `${organization.name} | Imóveis para comprar e alugar`),
      description: String(seo.description ?? organization.about ?? defaultHero.description),
    },
  }
}

export function customizationToDraft(config: SiteCustomization): SiteCustomization {
  return JSON.parse(JSON.stringify(config)) as SiteCustomization
}
