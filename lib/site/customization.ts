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
  theme: {
    pageBackground: string
    pageText: string
    mutedText: string
    primary: string
    primaryText: string
    secondary: string
    cardBackground: string
    headerBackground: string
    heroOverlay: string
    statsBackground: string
    featuredBackground: string
    buyRentBackground: string
    aboutBackground: string
    contactBackground: string
    footerBackground: string
    footerText: string
    buttonRadius: number
  }
  navigation: {
    home: string
    properties: string
    buy: string
    rent: string
    about: string
    contact: string
    cta: string
  }
  hero: {
    eyebrow: string
    title: string
    highlight: string
    description: string
    imageUrl: string
    ctaLabel: string
  }
  stats: {
    available: string
    sale: string
    rent: string
    citySingular: string
    cityPlural: string
  }
  sections: {
    featured: { enabled: boolean; eyebrow: string; title: string; description: string; ctaLabel: string; emptyText: string }
    buyRent: { enabled: boolean; title: string; description: string; buyLabel: string; buyTitle: string; buyDescription: string; rentLabel: string; rentTitle: string; rentDescription: string; ctaLabel: string }
    about: { enabled: boolean; eyebrow: string; title: string; body: string; imageUrl: string; benefits: string[] }
    contact: { enabled: boolean; eyebrow: string; title: string; description: string; whatsappLabel: string; formTitle: string }
  }
  footer: { navigationTitle: string; contactTitle: string; rightsText: string; signatureText: string }
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
  theme: {
    pageBackground: '#ffffff', pageText: '#172033', mutedText: '#667085', primary: '#155eef', primaryText: '#ffffff',
    secondary: '#f2f4f7', cardBackground: '#ffffff', headerBackground: '#ffffff', heroOverlay: '#172033',
    statsBackground: '#f8fafc', featuredBackground: '#ffffff', buyRentBackground: '#ffffff', aboutBackground: '#f2f4f7',
    contactBackground: '#ffffff', footerBackground: '#172033', footerText: '#ffffff', buttonRadius: 10,
  },
  navigation: { home: 'Início', properties: 'Imóveis', buy: 'Comprar', rent: 'Alugar', about: 'Sobre', contact: 'Contato', cta: 'Falar com corretor' },
  hero: {
    eyebrow: 'Imóveis que combinam com a sua vida',
    title: 'Encontre o lugar onde sua próxima história começa.',
    highlight: 'sua próxima história',
    description: 'Curadoria de imóveis para comprar e alugar, com atendimento próximo em cada etapa.',
    imageUrl: 'https://fwvccwfvjzvnmwqfiols.supabase.co/storage/v1/object/public/site-assets/site-demo/hero.png',
    ctaLabel: 'Explorar imóveis',
  },
  stats: { available: 'Imóveis disponíveis', sale: 'À venda', rent: 'Para alugar', citySingular: 'Cidade atendida', cityPlural: 'Cidades atendidas' },
  sections: {
    featured: { enabled: true, eyebrow: 'Seleção especial', title: 'Imóveis em destaque', description: 'Uma seleção atualizada para você encontrar seu próximo endereço com mais facilidade.', ctaLabel: 'Ver todos', emptyText: 'Em breve, novos imóveis por aqui.' },
    buyRent: { enabled: true, title: 'Escolha seu próximo capítulo', description: 'Do primeiro apartamento à casa dos sonhos.', buyLabel: 'Comprar', buyTitle: 'Encontre o imóvel certo para investir', buyDescription: 'Casas e apartamentos escolhidos para cada momento.', rentLabel: 'Alugar', rentTitle: 'Encontre o lar ideal para morar', rentDescription: 'Opções para todos os perfis, com processo simples e rápido.', ctaLabel: 'Ver imóveis' },
    about: { enabled: true, eyebrow: 'Por que escolher a gente', title: 'Atendimento que entende o que você procura.', body: 'Somos especialistas em conectar pessoas a espaços que fazem sentido para suas vidas.', imageUrl: '', benefits: ['Atendimento personalizado do início ao fim', 'Imóveis verificados e documentação em dia', 'Negociação transparente e segura'] },
    contact: { enabled: true, eyebrow: 'Vamos conversar', title: 'Seu próximo endereço pode estar mais perto do que você imagina.', description: 'Conte o que você procura e nossa equipe entra em contato com uma seleção feita para você.', whatsappLabel: 'Chamar no WhatsApp', formTitle: 'Conte o que você procura' },
  },
  footer: { navigationTitle: 'Navegação', contactTitle: 'Contato', rightsText: 'Todos os direitos reservados.', signatureText: 'Feito com IMOBA' },
  seo: { title: '', description: '' },
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export function safeSiteColor(value: unknown, fallback: string) {
  const color = String(value ?? '')
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback
}

export function getSiteCustomization(
  organization: Pick<SiteOrganization, 'name' | 'tagline' | 'logo_url' | 'hero_image_url' | 'phone' | 'whatsapp' | 'email' | 'instagram' | 'creci' | 'primary_color' | 'about'>,
  raw: unknown = {},
): SiteCustomization {
  const source = objectOrEmpty(raw)
  const brand = objectOrEmpty(source.brand)
  const theme = objectOrEmpty(source.theme)
  const navigation = objectOrEmpty(source.navigation)
  const hero = objectOrEmpty(source.hero)
  const stats = objectOrEmpty(source.stats)
  const sections = objectOrEmpty(source.sections)
  const footer = objectOrEmpty(source.footer)
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
    theme: {
      ...DEFAULT_SITE_CUSTOMIZATION.theme,
      ...theme,
      primary: String(theme.primary ?? brand.primaryColor ?? organization.primary_color ?? defaultBrand.primaryColor),
      buttonRadius: Math.min(24, Math.max(0, Number(theme.buttonRadius ?? DEFAULT_SITE_CUSTOMIZATION.theme.buttonRadius))),
    } as SiteCustomization['theme'],
    navigation: { ...DEFAULT_SITE_CUSTOMIZATION.navigation, ...navigation } as SiteCustomization['navigation'],
    hero: {
      eyebrow: String(hero.eyebrow ?? defaultHero.eyebrow),
      title: String(hero.title ?? defaultHero.title),
      highlight: String(hero.highlight ?? defaultHero.highlight),
      description: String(hero.description ?? defaultHero.description),
      imageUrl: String(hero.imageUrl ?? organization.hero_image_url ?? defaultHero.imageUrl),
      ctaLabel: String(hero.ctaLabel ?? defaultHero.ctaLabel),
    },
    stats: { ...DEFAULT_SITE_CUSTOMIZATION.stats, ...stats } as SiteCustomization['stats'],
    sections: {
      featured: { ...DEFAULT_SITE_CUSTOMIZATION.sections.featured, ...objectOrEmpty(sections.featured) },
      buyRent: { ...DEFAULT_SITE_CUSTOMIZATION.sections.buyRent, ...objectOrEmpty(sections.buyRent) },
      about: { ...DEFAULT_SITE_CUSTOMIZATION.sections.about, ...objectOrEmpty(sections.about), benefits: Array.isArray(objectOrEmpty(sections.about).benefits) ? objectOrEmpty(sections.about).benefits : DEFAULT_SITE_CUSTOMIZATION.sections.about.benefits } as SiteCustomization['sections']['about'],
      contact: { ...DEFAULT_SITE_CUSTOMIZATION.sections.contact, ...objectOrEmpty(sections.contact) },
    },
    footer: { ...DEFAULT_SITE_CUSTOMIZATION.footer, ...footer } as SiteCustomization['footer'],
    seo: {
      title: String(seo.title ?? `${organization.name} | Imóveis para comprar e alugar`),
      description: String(seo.description ?? organization.about ?? defaultHero.description),
    },
  }
}

export function customizationToDraft(config: SiteCustomization): SiteCustomization {
  return JSON.parse(JSON.stringify(config)) as SiteCustomization
}
