import CorretorHeader from '@/components/dashboard/corretor-header'
import { TenantInviteForm } from '@/components/tenant-invite-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function ClientsPage() {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const [{ data: profile }, { data: invites }, { data: roleAssignments }] = await Promise.all([
    admin.from('profiles').select('name').eq('id', access.userId).single(),
    admin.from('access_invites').select('id, name, document_last4, status, created_at').eq('organization_id', organizationId).eq('role', 'locatario').order('created_at', { ascending: false }),
    admin.from('user_roles').select('user_id').eq('organization_id', organizationId).eq('role', 'locatario'),
  ])

  const activeUserIds = roleAssignments?.map((item) => item.user_id) ?? []
  const { data: activeProfiles } = activeUserIds.length
    ? await admin.from('profiles').select('id, name, cpf').in('id', activeUserIds)
    : { data: [] }

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={access.email} />
      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:p-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Novo locatário</CardTitle>
            <CardDescription>Cadastre os dados que serão usados no primeiro acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantInviteForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locatários</CardTitle>
            <CardDescription>Acompanhe cadastros ativos e pendentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeProfiles?.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">CPF final {tenant.cpf?.slice(-4) ?? 'não informado'}</p>
                </div>
                <Badge>Ativo</Badge>
              </div>
            ))}

            {invites?.filter((invite) => invite.status === 'pending').map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{invite.name}</p>
                  <p className="text-sm text-muted-foreground">CPF final {invite.document_last4}</p>
                </div>
                <Badge variant="secondary">Primeiro acesso pendente</Badge>
              </div>
            ))}

            {!activeProfiles?.length && !invites?.some((invite) => invite.status === 'pending') ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum locatário cadastrado.</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
