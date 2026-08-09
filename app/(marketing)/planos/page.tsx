import type { Metadata } from 'next'
import { PricingSection } from '@/components/marketing/pricing-section'

export const metadata: Metadata = {
  title: 'Planos e preços — IMOBA',
  description:
    'Escolha o plano ideal para a sua imobiliária. Todos incluem o app para locatários, gestão de contratos e pagamentos. Comece hoje mesmo.',
}

export default function PlanosPage() {
  return <PricingSection />
}
