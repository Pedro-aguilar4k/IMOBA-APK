import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { StatsBar } from '@/components/marketing/stats-bar'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingPreview } from '@/components/marketing/pricing-preview'
import { CtaBand } from '@/components/marketing/cta-band'

export const metadata: Metadata = {
  title: 'IMOBA — A plataforma de gestão para a sua imobiliária',
  description:
    'IMOBA centraliza imóveis, contratos, pagamentos e o relacionamento com locatários em um só lugar. Ofereça um app moderno para seus clientes e gerencie tudo pelo painel.',
  openGraph: {
    title: 'IMOBA — Gestão imobiliária completa',
    description:
      'Imóveis, contratos, pagamentos e locatários em uma plataforma só. Um app moderno para seus clientes e um painel poderoso para a sua imobiliária.',
    type: 'website',
  },
}

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <PricingPreview />
      <CtaBand />
    </>
  )
}
