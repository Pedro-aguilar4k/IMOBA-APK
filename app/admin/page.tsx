import { BrokerAccountForm } from '@/components/broker-invite-form'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { ImpersonateButton } from '@/components/dashboard/impersonate-button'
import { SiteManageButton } from '@/components/dashboard/site-manage-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePlatformAdmin } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROOT_DOMAIN } from '@/lib/sites/host'

export default async function AdminPage() {
  const access = await requirePlatformAdmin()
  const admin = createAdminClient()
  const [{ data: organizations }, { data: brokerRoles }, { data: users }] = await Promise.all([
    admin
      .from('organizations')
      .select(
        'id, name, cnpj, status, slug, custom_domain, custom_domain_verified, site_published, created_at, access_invites(id, name, role, status)',
      )
      .order('created_at', { ascending: false }),
    admin
      .from('user_roles')
      .select('user_id, organization_id, role')
      .in('role', ['org_admin', 'corretor']),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const userById = new Map((users?.users ?? []).map((user) => [user.id, user]))
  // O responsável da imobiliária é o org_admin (dono); corretor é o fallback legado.
  const brokerByOrganization = new Map<string, ReturnType<typeof userById.get>>()
  for (const assignment of brokerRoles ?? []) {
    const existing = brokerByOrganization.get(assignment.organization_id)
    if (!existing || assignment.role === 'org_admin') {
      brokerByOrganization.set(assignment.organization_id, userById.get(assignment.user_id))
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} />
      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:p-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nova conta de corretor</CardTitle>
            <CardDescription>
              Cadastre a imobiliária e defina as credenciais temporárias do responsável.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrokerAccountForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imobiliárias cadastradas</CardTitle>
            <CardDescription>Acompanhe as contas de corretores e cadastros legados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {organizations?.length ? organizations.map((organization) => {
              const broker = brokerByOrganization.get(organization.id)
              const invites = Array.isArray(organization.access_invites)
                ? organization.access_invites
                : organization.access_invites
                  ? [organization.access_invites]
                  : []
              const legacyInvite = invites.find((invite) => invite.role === 'corretor' && invite.status === 'pending')

              return (
                <div key={organization.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{organization.name}</p>
                    <p className="text-sm leading-6 text-muted-foreground">CNPJ final {organization.cnpj.slice(-4)}</p>
                    <p className="truncate font-mono text-sm leading-6 text-muted-foreground">
                      {organization.custom_domain_verified && organization.custom_domain
                        ? organization.custom_domain
                        : `${organization.slug}.${ROOT_DOMAIN}`}
                      {organization.site_published ? (
                        <span className="ml-2 font-sans text-emerald-600">• publicado</span>
                      ) : (
                        <span className="ml-2 font-sans text-muted-foreground">• rascunho</span>
                      )}
                    </p>
                    {broker ? (
                      <>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Responsável: {String(broker.user_metadata?.name ?? 'Corretor')}
                        </p>
                        <p className="truncate text-sm leading-6 text-muted-foreground">{broker.email}</p>
                      </>
                    ) : legacyInvite ? (
                      <p className="text-sm leading-6 text-muted-foreground">
                        Convite legado de {legacyInvite.name}. Recrie a conta com e-mail e senha temporária.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant={broker ? 'default' : 'secondary'}>
                      {broker ? 'Conta ativa' : legacyInvite ? 'Cadastro legado' : 'Sem corretor'}
                    </Badge>
                    <SiteManageButton
                      organizationId={organization.id}
                      organizationName={organization.name}
                      slug={organization.slug}
                      customDomain={organization.custom_domain}
                      customDomainVerified={organization.custom_domain_verified}
                    />
                    <ImpersonateButton organizationId={organization.id} organizationName={organization.name} />
                  </div>
                </div>
              )
            }) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma imobiliária cadastrada.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
