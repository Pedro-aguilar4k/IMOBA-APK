import { BrokerAccountForm } from '@/components/broker-invite-form'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function BrokersPage() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const [{ data: organization }, { data: brokerRoles }, users] = await Promise.all([
    organizationId
      ? admin.from('organizations').select('name').eq('id', organizationId).maybeSingle()
      : Promise.resolve({ data: null }),
    organizationId
      ? admin
          .from('user_roles')
          .select('user_id, created_at')
          .eq('role', 'corretor')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const userById = new Map((users?.data?.users ?? []).map((user) => [user.id, user]))
  const brokers = (brokerRoles ?? [])
    .map((assignment) => userById.get(assignment.user_id))
    .filter((user): user is NonNullable<typeof user> => Boolean(user))

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} organizationName={organization?.name} />
      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:p-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Novo corretor</CardTitle>
            <CardDescription>
              Cadastre um corretor da {organization?.name ?? 'sua imobiliária'} e defina as
              credenciais temporárias de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrokerAccountForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corretores cadastrados</CardTitle>
            <CardDescription>
              Equipe de corretores com acesso ao painel da {organization?.name ?? 'sua imobiliária'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {brokers.length ? (
              brokers.map((broker) => (
                <div
                  key={broker.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {String(broker.user_metadata?.name ?? 'Corretor')}
                    </p>
                    <p className="truncate text-sm leading-6 text-muted-foreground">{broker.email}</p>
                  </div>
                  <Badge variant={broker.app_metadata?.must_change_password ? 'secondary' : 'default'}>
                    {broker.app_metadata?.must_change_password ? 'Acesso pendente' : 'Conta ativa'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum corretor cadastrado ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
