import { redirect } from 'next/navigation'
import { getCurrentAccess, getDefaultRoute } from '@/lib/auth/roles'
import { LandingPage } from '@/components/landing/landing-page'

export const metadata = {
  title: 'ImobApp — Site e app próprios para a sua imobiliária',
  description:
    'A plataforma que dá à sua imobiliária um site profissional, um app próprio e a gestão completa de imóveis, contratos, locatários e pagamentos.',
}

export default async function HomePage() {
  const access = await getCurrentAccess()

  // Usuário autenticado vai direto para a sua área.
  if (access) {
    if (access.mustChangePassword) redirect('/auth/trocar-senha')
    if (access.roles.length > 1) redirect('/role-select')
    redirect(getDefaultRoute(access.roles))
  }

  // Visitante anônimo vê a landing institucional da plataforma.
  return <LandingPage />
}
