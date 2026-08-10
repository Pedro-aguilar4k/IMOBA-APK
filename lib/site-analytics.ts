export type LeadStatus = 'novo' | 'contato' | 'visita' | 'proposta' | 'fechado' | 'perdido'
export type AppointmentStatus = 'agendado' | 'confirmado' | 'concluido' | 'cancelado'

export interface SiteLeadRow {
  id: string
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  source: string | null
  status: LeadStatus
  corretor_id: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentRow {
  id: string
  organization_id: string
  corretor_id: string | null
  client_name: string
  property_title: string | null
  scheduled_at: string
  status: AppointmentStatus
  created_at: string
}

export interface SiteVisitRow {
  id: string
  organization_id: string
  visited_at: string
  path: string | null
  referrer: string | null
  device: 'desktop' | 'mobile' | 'tablet' | null
}

export type ClientStatus = 'ativo' | 'inativo'

export interface ClientRow {
  id: string
  organization_id: string
  lead_id: string | null
  corretor_id: string | null
  name: string
  email: string | null
  phone: string | null
  document: string | null
  notes: string | null
  status: ClientStatus
  created_at: string
  updated_at: string
}

/** Leads considerados qualificados — prontos para virar cliente. */
export const QUALIFIED_LEAD_STATUSES: LeadStatus[] = ['visita', 'proposta', 'fechado']

export function isQualifiedLead(status: LeadStatus): boolean {
  return QUALIFIED_LEAD_STATUSES.includes(status)
}

/** Etapas do funil, na ordem (perdido é tratado à parte). */
export const FUNNEL_STAGES: Exclude<LeadStatus, 'perdido'>[] = [
  'novo',
  'contato',
  'visita',
  'proposta',
  'fechado',
]

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: 'Novo',
  contato: 'Em contato',
  visita: 'Visita agendada',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export function appointmentBadge(
  status: AppointmentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'confirmado':
      return 'default'
    case 'concluido':
      return 'secondary'
    case 'cancelado':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Agrega visitas por dia nos últimos `days` dias, preenchendo dias sem visita com zero.
 */
export function visitsByDay(
  visits: Pick<SiteVisitRow, 'visited_at'>[],
  days = 30,
): { date: string; label: string; visitas: number }[] {
  const buckets = new Map<string, number>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }

  for (const visit of visits) {
    const key = new Date(visit.visited_at).toISOString().slice(0, 10)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
  return Array.from(buckets.entries()).map(([date, visitas]) => ({
    date,
    label: fmt.format(new Date(`${date}T00:00:00`)),
    visitas,
  }))
}

/** Conta leads por etapa do funil. */
export function funnelCounts(leads: Pick<SiteLeadRow, 'status'>[]) {
  const counts: Record<LeadStatus, number> = {
    novo: 0,
    contato: 0,
    visita: 0,
    proposta: 0,
    fechado: 0,
    perdido: 0,
  }
  for (const lead of leads) counts[lead.status] += 1
  return counts
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

/** Rótulo de dia legível, com "Hoje"/"Amanhã" quando aplicável. */
export function formatDayLabel(iso: string): string {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(iso))
}

/** Agrupa agendamentos por dia (YYYY-MM-DD), preservando a ordem cronológica. */
export function groupAppointmentsByDay<T extends { scheduled_at: string }>(
  appointments: T[],
): { day: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>()
  for (const appointment of appointments) {
    const key = new Date(appointment.scheduled_at).toISOString().slice(0, 10)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(appointment)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({
      day,
      label: formatDayLabel(`${day}T00:00:00`),
      items,
    }))
}
