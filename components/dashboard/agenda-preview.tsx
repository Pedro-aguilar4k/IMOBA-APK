import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  APPOINTMENT_STATUS_LABEL,
  appointmentBadge,
  formatDateTime,
  type AppointmentRow,
} from '@/lib/site-analytics'

interface AgendaPreviewProps {
  appointments: (AppointmentRow & { corretorName?: string })[]
}

export function AgendaPreview({ appointments }: AgendaPreviewProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <CalendarClock className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Nenhuma visita agendada no momento.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {appointments.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-md bg-accent text-accent-foreground">
            <span className="text-xs font-medium uppercase">
              {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(item.scheduled_at))}
            </span>
            <span className="text-base font-bold leading-none">
              {new Date(item.scheduled_at).getDate()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{item.client_name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {item.property_title ?? 'Visita'} · {formatDateTime(item.scheduled_at)}
            </p>
            {item.corretorName ? (
              <p className="truncate text-xs text-muted-foreground">Corretor: {item.corretorName}</p>
            ) : null}
          </div>
          <Badge variant={appointmentBadge(item.status)}>
            {APPOINTMENT_STATUS_LABEL[item.status]}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
