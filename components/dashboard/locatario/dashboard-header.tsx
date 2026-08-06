import Link from 'next/link'
import { Bell } from 'lucide-react'

interface DashboardHeaderProps {
  name: string
  notifications?: number
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'L'
}

export default function DashboardHeader({ name, notifications = 0 }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-pretty text-2xl font-bold leading-tight">
            Olá, {firstName(name)}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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
            href="/dashboard/locatario/profile"
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
