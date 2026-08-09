export interface Plan {
  id: 'essencial' | 'profissional' | 'escala'
  name: string
  tagline: string
  /** Preço mensal em reais (BRL). */
  priceMonthly: number
  /** Destaque visual do plano no grid. */
  featured?: boolean
  /** Limite de imóveis ativos descrito ao cliente. */
  properties: string
  /** Limite de corretores/usuários. */
  seats: string
  features: string[]
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    tagline: 'Para imobiliárias começando a digitalizar a gestão.',
    priceMonthly: 149,
    properties: 'Até 50 imóveis ativos',
    seats: 'Até 3 corretores',
    features: [
      'Cadastro de imóveis com fotos',
      'Gestão de locatários e contratos',
      'Controle de pagamentos e recibos',
      'App do locatário (iOS e Android)',
      'Suporte por e-mail',
    ],
    cta: 'Assinar Essencial',
  },
  {
    id: 'profissional',
    name: 'Profissional',
    tagline: 'A escolha da maioria das imobiliárias em crescimento.',
    priceMonthly: 349,
    featured: true,
    properties: 'Até 250 imóveis ativos',
    seats: 'Até 10 corretores',
    features: [
      'Tudo do plano Essencial',
      'Chamados de manutenção integrados',
      'Documentos e assinaturas centralizados',
      'Relatórios de inadimplência',
      'Acesso biométrico e por CPF',
      'Suporte prioritário via WhatsApp',
    ],
    cta: 'Assinar Profissional',
  },
  {
    id: 'escala',
    name: 'Escala',
    tagline: 'Para redes e imobiliárias com alto volume.',
    priceMonthly: 799,
    properties: 'Imóveis ilimitados',
    seats: 'Corretores ilimitados',
    features: [
      'Tudo do plano Profissional',
      'Domínio próprio personalizado',
      'Múltiplas unidades / filiais',
      'Painel administrativo dedicado',
      'Gerente de conta exclusivo',
      'SLA de suporte garantido',
    ],
    cta: 'Falar com vendas',
  },
]

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id)
}
