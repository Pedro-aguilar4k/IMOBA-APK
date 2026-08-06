import { Building2, Home, MessageSquareText, Globe } from 'lucide-react'
import { BrokerAccountForm } from '@/components/broker-invite-form'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { AdminOrgList, type AdminOrgRow } from '@/components/dashboard/admin-org-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requirePlatformAdmin } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROOT_DOMAIN } from '@/lib/sites/host'

export default async function AdminPage() {
  const access = await requirePlatformAdmin()
  const admin = createAdminClient()

  const [
    { data: organizations },
    { data: brokerRoles },
    { data: users },
    { count: propertiesCount },
    { count: leadsCount },
    { count: newLeadsCount },
  ] = await Promise.all([
    admin
      .from('organizations')
      .select(
        'id, name, cnpj, status, slug, custom_domain, custom_domain_verified, site_published, created_at, access_invites(id, name, role, status)',
      )
      .order('created_at', { ascending: false }),
    admin.from('user_roles').select('user_id, organization_id, role').in('role', ['org_admin', 'corretor']),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('properties').select('id', { count: 'exact', head: true }),
    admin.from('leads').select('id', { count: 'exact', head: true }),
    admin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
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

  const orgs = organizations ?? []
  const publishedCount = orgs.filter((o) => o.site_published).length

  const rows: AdminOrgRow[] = orgs.map((organization) => {
    const broker = brokerByOrganization.get(organization.id)
    const invites = Array.isArray(organization.access_invites)
      ? organization.access_invites
      : organization.access_invites
        ? [organization.access_invites]
        : []
    const legacyInvite = invites.find((invite) => invite.role === 'corretor' && invite.status === 'pending')

    return {
      id: organization.id,
      name: organization.name,
      cnpjLast4: organization.cnpj.slice(-4),
      address:
        organization.custom_domain_verified && organization.custom_domain
          ? organization.custom_domain
          : `${organization.slug}.${ROOT_DOMAIN}`,
      published: Boolean(organization.site_published),
      slug: organization.slug,
      customDomain: organization.custom_domain,
      customDomainVerified: Boolean(organization.custom_domain_verified),
      responsibleName: broker ? String(broker.user_metadata?.name ?? 'Corretor') : null,
      responsibleEmail: broker?.email ?? null,
      legacyName: legacyInvite?.name ?? null,
      status: broker ? 'active' : legacyInvite ? 'legacy' : 'none',
    }
  })

  const stats = [
    { icon: Building2, label: 'Imobiliárias', value: orgs.length },
    { icon: Globe, label: 'Sites publicados', value: publishedCount },
    { icon: Home, label: 'Imóveis cadastrados', value: propertiesCount ?? 0 },
    {
      icon: MessageSquareText,
      label: 'Leads recebidos',
      value: leadsCount ?? 0,
      hint: newLeadsCount ? `${newLeadsCount} novos` : undefined,
    },
  ]

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        {/* Métricas */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Visão geral">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <stat.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-foreground">{stat.value}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {stat.label}
                    {stat.hint ? <span className="ml-1 text-primary">• {stat.hint}</span> : null}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Nova imobiliária</CardTitle>
              <CardDescription>
                Cadastre a imobiliária, defina o endereço do site e as credenciais temporárias do responsável.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrokerAccountForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imobiliárias cadastradas</CardTitle>
              <CardDescription>Gerencie sites, domínios, config do app e acesse cada conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminOrgList organizations={rows} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
