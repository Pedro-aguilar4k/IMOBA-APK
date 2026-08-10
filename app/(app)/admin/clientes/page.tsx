import { Contact, Sparkles } from 'lucide-react'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { ClientCreateForm } from '@/components/dashboard/client-create-form'
import { ConvertLeadButton } from '@/components/dashboard/convert-lead-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth/roles'
import {
  LEAD_STATUS_LABEL,
  QUALIFIED_LEAD_STATUSES,
  formatShortDate,
  type ClientRow,
  type SiteLeadRow,
} from '@/lib/site-analytics'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function ClientsPage() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const [{ data: organization }, { data: clients }, { data: qualifiedLeads }] = await Promise.all([
    organizationId
      ? admin.from('organizations').select('name').eq('id', organizationId).maybeSingle()
      : Promise.resolve({ data: null }),
    organizationId
      ? admin
          .from('clients')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ClientRow[] }),
    organizationId
      ? admin
          .from('site_leads')
          .select('*')
          .eq('organization_id', organizationId)
          .in('status', QUALIFIED_LEAD_STATUSES)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] as SiteLeadRow[] }),
  ])

  const clientRows = (clients ?? []) as ClientRow[]
  const convertedLeadIds = new Set(clientRows.map((c) => c.lead_id).filter(Boolean))
  // Leads qualificados que ainda não viraram cliente.
  const convertibleLeads = ((qualifiedLeads ?? []) as SiteLeadRow[]).filter(
    (lead) => !convertedLeadIds.has(lead.id),
  )

  const activeCount = clientRows.filter((c) => c.status === 'ativo').length

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} organizationName={organization?.name} />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {clientRows.length} {clientRows.length === 1 ? 'cliente' : 'clientes'} · {activeCount} ativos
            na {organization?.name ?? 'sua imobiliária'}.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="flex flex-col gap-6">
            {/* Leads qualificados prontos para conversão */}
            {convertibleLeads.length > 0 ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" aria-hidden="true" />
                    Leads qualificados
                  </CardTitle>
                  <CardDescription>
                    Estes leads avançaram no funil e estão prontos para virar clientes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {convertibleLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{lead.name}</p>
                          <Badge variant="secondary">{LEAD_STATUS_LABEL[lead.status]}</Badge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {lead.email ?? lead.phone ?? 'Sem contato'} · {formatShortDate(lead.created_at)}
                        </p>
                      </div>
                      <ConvertLeadButton leadId={lead.id} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {/* Lista de clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Base de clientes</CardTitle>
                <CardDescription>Clientes cadastrados e convertidos de leads.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {clientRows.length ? (
                  clientRows.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{client.name}</p>
                          {client.lead_id ? (
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="size-3" aria-hidden="true" />
                              de lead
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {client.email ?? client.phone ?? 'Sem contato'} · Desde{' '}
                          {formatShortDate(client.created_at)}
                        </p>
                      </div>
                      <Badge variant={client.status === 'ativo' ? 'default' : 'secondary'}>
                        {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <Contact className="size-9 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum cliente ainda. Converta um lead qualificado ou cadastre manualmente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cadastro manual */}
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Novo cliente</CardTitle>
              <CardDescription>Cadastre um cliente diretamente na base.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientCreateForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
