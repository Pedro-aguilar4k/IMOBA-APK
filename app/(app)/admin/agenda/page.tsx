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

  const [{ data: organization }, { data: appointments }, { data: brokerRoles }, { data: leads }, users] =
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
        : Promise.resolve({ data: [] }),
      organizationId
        ? admin
            .from('site_leads')
            .select('id, name, status')
            .eq('organization_id', organizationId)
            .in('status', ['novo', 'contato', 'visita', 'proposta'])
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as Pick<SiteLeadRow, 'id' | 'name' | 'status'>[] }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

  const userById = new Map((users?.data?.users ?? []).map((u) => [u.id, u]))
  const corretorName = (id: string | null) =>
    id ? String(userById.get(id)?.user_metadata?.name ?? 'Corretor') : ''

  const appointmentRows = (appointments ?? []) as AppointmentRow[]
  const brokers = (brokerRoles ?? [])
    .map((r) => {
      const user = userById.get(r.user_id)
      return user ? { id: user.id, name: String(user.user_metadata?.name ?? user.email ?? 'Corretor') } : null
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
