import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentAccess, getDefaultRoute, type AppRole } from '@/lib/auth/roles'

const roleContent: Record<AppRole, { title: string; description: string; href: string }> = {
  superadmin: {
    title: 'Super Admin',
    description: 'Gerenciar clientes, assinaturas e sites da plataforma',
    href: '/plataforma',
  },
  admin: {
    title: 'Administrador',
    description: 'Gerenciar corretores e acessos da plataforma',
    href: '/admin',
  },
  corretor: {
    title: 'Corretor',
    description: 'Gerenciar imóveis, contratos e locatários',
    href: '/dashboard/corretor',
  },
  locatario: {
    title: 'Locatário',
    description: 'Acompanhar contrato, pagamentos e solicitações',
    href: '/dashboard/locatario',
  },
}

export default async function RoleSelectPage() {
  const access = await getCurrentAccess()

  if (!access) redirect('/auth/login')
  if (access.roles.length <= 1) redirect(getDefaultRoute(access.roles))

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selecione seu contexto</CardTitle>
          <CardDescription>Escolha como deseja acessar o aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {access.roles.map(({ role, organization_id }) => {
            const content = roleContent[role]
            return (
              <Button
                key={`${role}-${organization_id ?? 'global'}`}
                render={<Link href={content.href} />}
                variant="outline"
                className="h-auto justify-start py-4 text-left"
              >
                <span className="flex flex-col items-start gap-1">
                  <span className="font-semibold">{content.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">{content.description}</span>
                </span>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </main>
  )
}
