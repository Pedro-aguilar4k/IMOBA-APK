import { AdminHeader } from '@/components/dashboard/admin-header'
import { AgendaTimeline } from '@/components/dashboard/agenda-timeline'
import { ScheduleForm } from '@/components/dashboard/schedule-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth/roles'
import { type AppointmentRow, type SiteLeadRow } from '@/lib/site-analytics'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AgendaPage() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const nowIso = new Date().toISOString()

  const [{ data: organization }, { data: appointments }, { data: brokerRoles }, { data: leads }] =
    await Promise.all([
      organizationId
        ? admin.from('organizations').select('name').eq('id', organizationId).maybeSingle()
        : Promise.resolve({ data: null }),
      organizationId
        ? admin
            .from('appointments')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('scheduled_at', nowIso)
            .order('scheduled_at', { ascending: true })
        : Promise.resolve({ data: [] as AppointmentRow[] }),
      organizationId
        ? admin
            .from('user_roles')
            .select('user_id')
            .eq('role', 'corretor')
            .eq('organization_id', organizationId)
        : Promise.resolve({ data: [] as { user_id: string }[] }),
      organizationId
        ? admin
            .from('site_leads')
            .select('id, name, status')
            .eq('organization_id', organizationId)
            .in('status', ['novo', 'contato', 'visita', 'proposta'])
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as Pick<SiteLeadRow, 'id' | 'name' | 'status'>[] }),
    ])

  const appointmentRows = (appointments ?? []) as AppointmentRow[]
  const brokerIds = ((brokerRoles ?? []) as { user_id: string }[]).map((r) => r.user_id)

  // Nomes apenas dos corretores da organização + envolvidos na agenda (escopo do tenant).
  const relevantIds = [
    ...new Set([
      ...brokerIds,
      ...appointmentRows.map((a) => a.corretor_id).filter((id): id is string => Boolean(id)),
    ]),
  ]
  const { data: profiles } = relevantIds.length
    ? await admin.from('profiles').select('id, name, email').in('id', relevantIds)
    : { data: [] as { id: string; name: string | null; email: string | null }[] }
  const profById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const corretorName = (id: string | null) => (id ? (profById.get(id)?.name ?? 'Corretor') : '')

  const brokers = brokerIds
    .map((id) => {
      const p = profById.get(id)
      return p ? { id, name: p.name ?? p.email ?? 'Corretor' } : null
    })
    .filter((b): b is { id: string; name: string } => Boolean(b))

  const leadOptions = ((leads ?? []) as Pick<SiteLeadRow, 'id' | 'name'>[]).map((l) => ({
    id: l.id,
    name: l.name,
  }))

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} organizationName={organization?.name} />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
            Agenda da equipe
          </h2>
          <p className="text-sm text-muted-foreground">
            Visitas de todos os corretores da {organization?.name ?? 'sua imobiliária'}, sincronizadas
            em um só lugar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <Card>
            <CardHeader>
              <CardTitle>Próximas visitas</CardTitle>
              <CardDescription>
                {appointmentRows.length} {appointmentRows.length === 1 ? 'visita agendada' : 'visitas agendadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgendaTimeline
                appointments={appointmentRows.map((a) => ({
                  ...a,
                  corretorName: corretorName(a.corretor_id),
                }))}
              />
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Marcar visita</CardTitle>
              <CardDescription>Agende um lead com um corretor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleForm leads={leadOptions} brokers={brokers} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
