import Link from 'next/link'
import { ArrowUpRight, CalendarClock, Filter, MousePointerClick, Users } from 'lucide-react'

import { AdminHeader } from '@/components/dashboard/admin-header'
import { AgendaPreview } from '@/components/dashboard/agenda-preview'
import { LeadFunnel } from '@/components/dashboard/lead-funnel'
import { MetricCard } from '@/components/dashboard/metric-card'
import { VisitsChart } from '@/components/dashboard/visits-chart'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { requireRole } from '@/lib/auth/roles'
import {
  LEAD_STATUS_LABEL,
  formatShortDate,
  funnelCounts,
  visitsByDay,
  type AppointmentRow,
  type SiteLeadRow,
  type SiteVisitRow,
} from '@/lib/site-analytics'
import { createAdminClient } from '@/lib/supabase/admin'

const PERIOD_DAYS = 30

export default async function AdminDashboardPage() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const since = new Date()
  since.setDate(since.getDate() - PERIOD_DAYS)
  const sinceIso = since.toISOString()
  const nowIso = new Date().toISOString()

  const [{ data: organization }, { data: visits }, { data: leads }, { data: appointments }, users] =
    await Promise.all([
      organizationId
        ? admin
            .from('organizations')
            .select('name, custom_domain, domain_status')
            .eq('id', organizationId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      organizationId
        ? admin
            .from('site_visits')
            .select('visited_at')
            .eq('organization_id', organizationId)
            .gte('visited_at', sinceIso)
        : Promise.resolve({ data: [] as Pick<SiteVisitRow, 'visited_at'>[] }),
      organizationId
        ? admin
            .from('site_leads')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as SiteLeadRow[] }),
      organizationId
        ? admin
            .from('appointments')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('scheduled_at', nowIso)
            .order('scheduled_at', { ascending: true })
            .limit(5)
        : Promise.resolve({ data: [] as AppointmentRow[] }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

  const visitRows = (visits ?? []) as Pick<SiteVisitRow, 'visited_at'>[]
  const leadRows = (leads ?? []) as SiteLeadRow[]
  const appointmentRows = (appointments ?? []) as AppointmentRow[]

  const userById = new Map((users?.data?.users ?? []).map((u) => [u.id, u]))
  const corretorName = (id: string | null) =>
    id ? String(userById.get(id)?.user_metadata?.name ?? '') : ''

  // Métricas do período
  const totalVisits = visitRows.length
  const leadsInPeriod = leadRows.filter((l) => l.created_at >= sinceIso)
  const totalLeads = leadsInPeriod.length
  const counts = funnelCounts(leadRows)
  const closed = leadsInPeriod.filter((l) => l.status === 'fechado').length
  const conversion = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0

  const chartData = visitsByDay(visitRows, PERIOD_DAYS)
  const recentLeads = leadRows.slice(0, 6)

  // "Ir para o site"
  const hasDomain = Boolean(organization?.custom_domain)
  const siteHref = hasDomain ? `https://${organization?.custom_domain}` : '/admin/conta'

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} organizationName={organization?.name} />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        {/* Cabeçalho + botão ir para o site */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
              Desempenho do site
            </h2>
            <p className="text-sm text-muted-foreground">
              Últimos {PERIOD_DAYS} dias · {organization?.name ?? 'sua imobiliária'}
            </p>
          </div>
          <Link
            href={siteHref}
            {...(hasDomain ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cn(buttonVariants({ variant: 'default' }), 'h-11 gap-2 rounded-full px-5')}
          >
            Ir para o site
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Visitantes"
            value={totalVisits.toLocaleString('pt-BR')}
            hint={`Acessos em ${PERIOD_DAYS} dias`}
            icon={MousePointerClick}
          />
          <MetricCard
            label="Leads coletados"
            value={totalLeads.toLocaleString('pt-BR')}
            hint="Contatos captados pelo site"
            icon={Users}
          />
          <MetricCard
            label="Taxa de conversão"
            value={`${conversion}%`}
            hint={`${closed} ${closed === 1 ? 'negócio fechado' : 'negócios fechados'}`}
            icon={Filter}
          />
          <MetricCard
            label="Visitas agendadas"
            value={appointmentRows.length.toLocaleString('pt-BR')}
            hint="Próximos compromissos"
            icon={CalendarClock}
          />
        </div>

        {/* Visitas + Funil */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Acessos ao site</CardTitle>
              <CardDescription>Visitantes por dia nos últimos {PERIOD_DAYS} dias</CardDescription>
            </CardHeader>
            <CardContent>
              <VisitsChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funil de leads</CardTitle>
              <CardDescription>Distribuição dos leads por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadFunnel counts={counts} />
            </CardContent>
          </Card>
        </div>

        {/* Agenda + Leads recentes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agenda dos corretores</CardTitle>
              <CardDescription>Próximas visitas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <AgendaPreview
                appointments={appointmentRows.map((a) => ({
                  ...a,
                  corretorName: corretorName(a.corretor_id),
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads recentes</CardTitle>
              <CardDescription>Últimos contatos recebidos pelo site</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentLeads.length ? (
                recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{lead.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {lead.email ?? lead.phone ?? 'Sem contato'} · {formatShortDate(lead.created_at)}
                      </p>
                    </div>
                    <Badge variant={lead.status === 'fechado' ? 'default' : 'secondary'}>
                      {LEAD_STATUS_LABEL[lead.status]}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum lead recebido ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
