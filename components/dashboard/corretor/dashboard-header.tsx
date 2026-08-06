import Link from 'next/link'
import { Bell } from 'lucide-react'

interface DashboardHeaderProps {
  name: string
  email?: string
  notifications?: number
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'C'
}

export default function DashboardHeader({ name, notifications = 0 }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-colors hover:bg-accent/70"
            aria-label={`Notificações${notifications ? `: ${notifications} novas` : ''}`}
          >
            <Bell className="size-5" />
            {notifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground ring-2 ring-background">
                {notifications > 9 ? '9+' : notifications}
              </span>
            ) : null}
          </button>
          <Link
            href="/dashboard/corretor/profile"
            className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-label="Meu perfil"
          >
            {initials(name)}
          </Link>
        </div>
      </div>
    </header>
  )
}
