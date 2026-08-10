import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentAccess } from '@/lib/auth/roles'

export default async function PendingAccessPage() {
  const access = await getCurrentAccess()

  if (!access) redirect('/auth/login')
  if (access.roles.length > 0) redirect('/painel')

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acesso aguardando configuração</CardTitle>
          <CardDescription>
            Sua conta foi autenticada, mas ainda não possui um perfil administrativo associado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/auth/login" />} variant="outline" className="w-full">
            Voltar para o login
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
