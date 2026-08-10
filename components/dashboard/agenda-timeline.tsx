import { CalendarX2, Clock, MapPin, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  APPOINTMENT_STATUS_LABEL,
  appointmentBadge,
  formatTime,
  groupAppointmentsByDay,
  type AppointmentRow,
} from '@/lib/site-analytics'

type AgendaItem = AppointmentRow & { corretorName?: string }

interface AgendaTimelineProps {
  appointments: AgendaItem[]
}

export function AgendaTimeline({ appointments }: AgendaTimelineProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <CalendarX2 className="size-9 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">Nenhuma visita agendada</p>
          <p className="text-sm text-muted-foreground">
            Use o formulário ao lado para marcar a primeira visita.
          </p>
        </div>
      </div>
    )
  }

  const groups = groupAppointmentsByDay(appointments)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.day} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold capitalize text-foreground">{group.label}</h3>
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              {group.items.length} {group.items.length === 1 ? 'visita' : 'visitas'}
            </span>
          </div>

          <ul className="flex flex-col gap-3">
            {group.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-accent-foreground">
                    <Clock className="size-4" aria-hidden="true" />
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTime(item.scheduled_at)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.client_name}</p>
                    <div className="mt-0.5 flex flex-col gap-0.5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
                      {item.property_title ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {item.property_title}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <UserRound className="size-3.5" aria-hidden="true" />
                        {item.corretorName || 'Sem corretor'}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={appointmentBadge(item.status)} className="w-fit">
                  {APPOINTMENT_STATUS_LABEL[item.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
